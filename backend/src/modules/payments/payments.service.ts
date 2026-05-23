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
      await stripe.subscriptions.update(sub.id, {
        items: [{ id: sub.items.data[0].id, price: priceId }],
        metadata: { userId, planType: "YEARLY" },
        proration_behavior: "always_invoice",
      });
      // Webhook customer.subscription.updated will sync the status + plan type
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
        success_url: `${env.clientUrl}/payment/success`,
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

    const isSubscription = input.planType !== "LIFETIME";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(isSubscription
        ? { subscription_data: { metadata: { userId, planType: input.planType } } }
        : {}),
      success_url: input.successUrl || `${env.clientUrl}/payment/success`,
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

        const subscriptionStatus = PLAN_TO_SUBSCRIPTION[planType] || "MONTHLY";

        // Retrieve actual Stripe subscription data if available
        let stripeSubscriptionId: string | null = null;
        let subscriptionEnd: Date | null = null;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          stripeSubscriptionId = subscription.id;
          subscriptionEnd = new Date(
            (subscription.current_period_end || 0) * 1000
          );
        }

        // Handle upgrade — cancel any old active subscriptions
        if (session.metadata?.isUpgrade === "true") {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true },
          });
          if (user?.stripeCustomerId) {
            const oldSubs = await stripe.subscriptions.list({
              customer: user.stripeCustomerId,
              status: "active",
              limit: 10,
            });
            for (const sub of oldSubs.data) {
              if (sub.id !== stripeSubscriptionId) {
                await stripe.subscriptions.cancel(sub.id);
              }
            }
          }
        }

        await Promise.all([
          prisma.payment.upsert({
            where: { stripePaymentId: session.id },
            update: {},
            create: {
              userId,
              stripePaymentId: session.id,
              stripeSubscriptionId,
              amount: session.amount_total || 0,
              currency: session.currency || "usd",
              status: "SUCCEEDED",
              planType,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus,
              subscriptionEnd,
              stripeSubscriptionId,
            },
          }),
        ]);

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        // Read plan type from subscription metadata (set during checkout or upgrade)
        const planType = subscription.metadata?.planType as
          | PlanType
          | undefined;

        // Prefer lookup by subscription ID, fallback to customer ID
        let user = await prisma.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user) {
          const customerId = subscription.customer as string;
          user = await prisma.user.findUnique({
            where: { stripeCustomerId: customerId },
          });
          if (!user) break;
        }

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        if (isActive) {
          const updateData: Record<string, any> = {
            stripeSubscriptionId: subscription.id,
            subscriptionEnd: new Date(
              (subscription.current_period_end || 0) * 1000
            ),
          };

          // Sync plan type if available from subscription metadata
          if (planType && PLAN_TO_SUBSCRIPTION[planType]) {
            updateData.subscriptionStatus = PLAN_TO_SUBSCRIPTION[planType];
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        } else {
          // Check if this is an upgrade scenario — user may have a recent lifetime payment
          if (user.subscriptionStatus === "LIFETIME") break;

          const recentUpgrade = await prisma.payment.findFirst({
            where: {
              userId: user.id,
              planType: "LIFETIME",
              status: "SUCCEEDED",
              createdAt: { gte: new Date(Date.now() - 60000) }, // within last 60s
            },
          });
          if (recentUpgrade) break;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: "FREE",
              stripeSubscriptionId: null,
              subscriptionEnd: null,
            },
          });
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
        stripeSubscriptionId: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  export async function createPortalSession(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new AppError("No Stripe customer found", 400);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.clientUrl}/dashboard`,
    });

    return { url: session.url };
  }

  export async function getHistory(userId: string, all?: boolean) {
    if (all) {
      return prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      });
    }
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }
}
