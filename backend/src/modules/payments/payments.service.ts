import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";
import type { CreateCheckoutInput } from "./payments.schema";
import type { PlanType, PaymentStatus, SubscriptionStatus } from "@prisma/client";

const PLAN_TO_PRICE: Record<string, string> = {
  MONTHLY: env.stripe.prices.monthly,
  YEARLY: env.stripe.prices.yearly,
  LIFETIME: env.stripe.prices.lifetime,
};

const PLAN_TO_SUBSCRIPTION: Record<string, SubscriptionStatus> = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  LIFETIME: "LIFETIME",
};

export namespace PaymentsService {
  export async function createCheckoutSession(userId: string, input: CreateCheckoutInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const priceId = PLAN_TO_PRICE[input.planType];
    if (!priceId) throw new AppError("Invalid plan type", 400);

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
      success_url: input.successUrl || `${env.clientUrl}/dashboard?payment=success`,
      cancel_url: input.cancelUrl || `${env.clientUrl}/#pricing?payment=cancelled`,
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
          prisma.payment.create({
            data: {
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
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: isActive ? "MONTHLY" : "FREE",
              subscriptionEnd: isActive
                ? new Date((subscription.current_period_end || 0) * 1000)
                : null,
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
