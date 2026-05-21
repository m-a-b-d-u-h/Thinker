import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";
import type { CreateCheckoutInput } from "./payments.schema";
import type { PlanType, PaymentStatus, SubscriptionStatus } from "@prisma/client";

const PLAN_CONFIG = {
  MONTHLY: { name: "Thinker Monthly", price: 1000 },
  YEARLY: { name: "Thinker Yearly", price: 5000 },
  LIFETIME: { name: "Thinker Lifetime", price: 10000 },
} as const;

let priceCache: Record<string, string> | null = null;

async function getPriceId(planType: string): Promise<string> {
  if (env.stripe.prices[planType.toLowerCase() as keyof typeof env.stripe.prices]) {
    return env.stripe.prices[planType.toLowerCase() as keyof typeof env.stripe.prices];
  }

  if (priceCache?.[planType]) return priceCache[planType];

  const config = PLAN_CONFIG[planType as keyof typeof PLAN_CONFIG];
  if (!config) throw new AppError("Invalid plan type", 400);

  const products = await stripe.products.list({ limit: 100, active: true });
  let product = products.data.find((p) => p.name === config.name);

  if (!product) {
    product = await stripe.products.create({
      name: config.name,
      description: `Thinker — ${planType.toLowerCase()} subscription plan`,
    });
  }

  const existingPrices = await stripe.prices.list({
    product: product.id,
    limit: 1,
    active: true,
  });

  if (existingPrices.data.length > 0) {
    if (!priceCache) priceCache = {};
    priceCache[planType] = existingPrices.data[0].id;
    return existingPrices.data[0].id;
  }

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: config.price,
    currency: "usd",
    recurring: planType === "LIFETIME" ? undefined : { interval: planType === "MONTHLY" ? "month" : "year" },
  });

  if (!priceCache) priceCache = {};
  priceCache[planType] = price.id;
  return price.id;
}

const PLAN_TO_SUBSCRIPTION: Record<string, SubscriptionStatus> = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  LIFETIME: "LIFETIME",
};

export namespace PaymentsService {
  export async function verifySession(userId: string, sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      throw new AppError("Payment not completed", 400);
    }

    const metaUserId = session.metadata?.userId;
    const planType = session.metadata?.planType as PlanType | undefined;

    if (!metaUserId || metaUserId !== userId) {
      throw new AppError("Session does not belong to this user", 403);
    }
    if (!planType) {
      throw new AppError("Invalid session metadata", 400);
    }

    // Handle upgrade payment — cancel old subscription
    if (session.metadata?.isUpgrade === "true") {
      const previousPlan = session.metadata?.previousPlan;
      if (previousPlan && previousPlan !== "FREE") {
        const subs = await stripe.subscriptions.list({ customer: session.customer as string, status: "active", limit: 1 });
        for (const sub of subs.data) {
          await stripe.subscriptions.cancel(sub.id);
        }
      }
    }

    const subscriptionStatus = PLAN_TO_SUBSCRIPTION[planType] || "MONTHLY";
    const subscriptionEnd =
      planType === "MONTHLY"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : planType === "YEARLY"
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : null;

    await Promise.all([
      prisma.payment.upsert({
        where: { stripePaymentId: sessionId },
        update: {},
        create: {
          userId,
          stripePaymentId: sessionId,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          status: "SUCCEEDED",
          planType,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus, subscriptionEnd },
      }),
    ]);

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        subscriptionStatus: true,
        preferredCategories: true,
      },
    });
  }

  export async function activatePending(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    if (!user.stripeCustomerId) throw new AppError("No Stripe customer found", 400);
    if (user.subscriptionStatus !== "FREE") return user;

    const sessions = await stripe.checkout.sessions.list({
      customer: user.stripeCustomerId,
      limit: 5,
      expand: ["data.line_items"],
    });

    const paid = sessions.data.find(
      (s) => s.payment_status === "paid" && s.metadata?.planType
    );

    if (!paid) throw new AppError("No completed payment found", 404);

    return verifySession(userId, paid.id);
  }

  export async function upgradeSubscription(userId: string, newPlanType: PlanType) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const currentPlan = user.subscriptionStatus;
    if (currentPlan === "FREE") throw new AppError("No subscription to upgrade", 400);
    if (currentPlan === newPlanType) throw new AppError("Already on this plan", 400);

    const planOrder: Record<string, number> = { MONTHLY: 1, YEARLY: 2, LIFETIME: 3 };
    if (planOrder[newPlanType] <= planOrder[currentPlan]) {
      throw new AppError("Cannot downgrade", 400);
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) throw new AppError("No Stripe customer found", 400);

    if (newPlanType === "YEARLY" && currentPlan === "MONTHLY") {
      const priceId = await getPriceId("YEARLY");
      const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, status: "active", limit: 1 });
      if (subs.data.length === 0) throw new AppError("No active subscription", 400);
      const sub = subs.data[0];
      const updatedSub = await stripe.subscriptions.update(sub.id, {
        items: [{ id: sub.items.data[0].id, price: priceId }],
        proration_behavior: "always_invoice",
      });
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: "YEARLY",
          subscriptionEnd: new Date((updatedSub.current_period_end || 0) * 1000),
        },
      });
      return { success: true };
    }

    if (newPlanType === "LIFETIME") {
      const currentPrice = PLAN_CONFIG[currentPlan as keyof typeof PLAN_CONFIG]?.price || 0;
      const diff = PLAN_CONFIG.LIFETIME.price - currentPrice;
      if (diff <= 0) throw new AppError("No payment needed", 400);

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: `Upgrade to Lifetime` },
            unit_amount: diff,
          },
          quantity: 1,
        }],
        success_url: `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.clientUrl}/#pricing`,
        metadata: { userId, planType: "LIFETIME", isUpgrade: "true", previousPlan: currentPlan },
      });

      return { url: session.url, sessionId: session.id, prorated: true, diff };
    }

    throw new AppError("Invalid upgrade path", 400);
  }

  export async function createCheckoutSession(userId: string, input: CreateCheckoutInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const priceId = await getPriceId(input.planType);

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: input.planType === "LIFETIME" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.successUrl || `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: input.cancelUrl || `${env.clientUrl}/#pricing`,
      metadata: { userId, planType: input.planType },
    });

    return { url: session.url, sessionId: session.id };
  }

  export async function handleWebhook(rawBody: string, signature: string) {
    const event = stripe.webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType as PlanType | undefined;

        if (!userId || !planType) {
          console.warn("Missing userId or planType in webhook");
          break;
        }

        const status: PaymentStatus = "SUCCEEDED";
        const subscriptionStatus = PLAN_TO_SUBSCRIPTION[planType] || "MONTHLY";

        const subscriptionEnd =
          planType === "MONTHLY"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : planType === "YEARLY"
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
              : null;

        await Promise.all([
          prisma.payment.upsert({
            where: { stripePaymentId: session.id },
            update: {},
            create: {
              userId,
              stripePaymentId: session.id,
              amount: session.amount_total || 0,
              currency: session.currency || "usd",
              status,
              planType,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus,
              subscriptionEnd,
            },
          }),
        ]);

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const isActive =
            subscription.status === "active" || subscription.status === "trialing";
          if (isActive) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionEnd: new Date((subscription.current_period_end || 0) * 1000),
              },
            });
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: "FREE",
                subscriptionEnd: null,
              },
            });
          }
        }
        break;
      }
    }

    return { received: true };
  }

  export async function getSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        subscriptionEnd: true,
        stripeCustomerId: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  export async function getHistory(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
}
