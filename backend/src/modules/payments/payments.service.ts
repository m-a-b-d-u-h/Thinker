import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";
import { sendToUser } from "../../lib/websocket";
import type { CreateCheckoutInput } from "./payments.schema";
import type { PlanType, PaymentStatus, SubscriptionStatus } from "@prisma/client";

async function getPlanByType(planType: string) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { planType: planType as any } });
  if (!plan) throw new AppError("Invalid plan type", 400);
  return plan;
}

async function getPrice(planType: string): Promise<number> {
  const plan = await getPlanByType(planType);
  return plan.price;
}

let priceCache: Record<string, string> | null = null;

async function getPriceId(planType: string): Promise<string> {
  if (env.stripe.prices[planType.toLowerCase() as keyof typeof env.stripe.prices]) {
    return env.stripe.prices[planType.toLowerCase() as keyof typeof env.stripe.prices];
  }

  if (priceCache?.[planType]) return priceCache[planType];

  const config = await getPlanByType(planType);

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
    recurring: planType === "LIFETIME" ? undefined : { interval: (config.interval || "month") as "month" | "year" },
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

    // ALL upgrades go through checkout — payment BEFORE upgrade
    const currentPrice = await getPrice(currentPlan);
    const newPrice = await getPrice(newPlanType);
    const diff = newPrice - currentPrice;
    if (diff <= 0) throw new AppError("No payment needed", 400);

    const newPlan = await getPlanByType(newPlanType);
    const newPlanName = newPlan.name;
    const isSubscription = newPlanType !== "LIFETIME";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: isSubscription ? "subscription" : "payment",
      line_items: isSubscription
        ? [{ price: await getPriceId(newPlanType), quantity: 1 }]
        : [{
            price_data: {
              currency: "usd",
              product_data: { name: `Upgrade to ${newPlanName}` },
              unit_amount: diff,
            },
            quantity: 1,
          }],
      ...(isSubscription
        ? { subscription_data: { metadata: { userId, planType: newPlanType, isUpgrade: "true", previousPlan: currentPlan } } }
        : {}),
      success_url: `${env.clientUrl}/payment/success`,
      cancel_url: `${env.clientUrl}/#pricing`,
      metadata: { userId, planType: newPlanType, isUpgrade: "true", previousPlan: currentPlan },
    });

    return { url: session.url, sessionId: session.id, prorated: !isSubscription, diff };
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

        // Upgrade — cancel old subscriptions AFTER payment confirmed
        const previousPlan = session.metadata?.previousPlan;
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

        // For subscription upgrades, also update the new subscription's metadata
        if (session.mode === "subscription" && session.subscription && previousPlan) {
          await stripe.subscriptions.update(session.subscription as string, {
            metadata: { userId, planType, isUpgrade: "true", previousPlan },
          });
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

        // Notify user via WebSocket
        sendToUser(userId, { type: "payment_success", planType, subscriptionStatus });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const planType = subscription.metadata?.planType as PlanType | undefined;

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

          if (planType && PLAN_TO_SUBSCRIPTION[planType]) {
            updateData.subscriptionStatus = PLAN_TO_SUBSCRIPTION[planType];
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        } else {
          if (user.subscriptionStatus === "LIFETIME") break;

          const recentUpgrade = await prisma.payment.findFirst({
            where: {
              userId: user.id,
              planType: "LIFETIME",
              status: "SUCCEEDED",
              createdAt: { gte: new Date(Date.now() - 60000) },
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
