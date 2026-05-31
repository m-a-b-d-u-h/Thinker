import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { LemonSqueezy } from "../../config/lemon-squeezy";
import { env } from "../../config/env";
import { sendToUser } from "../../lib/websocket";
import type { CreateCheckoutInput } from "./payments.schema";

const VARIANT_MAP: Record<string, string> = {
  MONTHLY: env.lemonSqueezy.variantIds.monthly,
  YEARLY: env.lemonSqueezy.variantIds.yearly,
  LIFETIME: env.lemonSqueezy.variantIds.lifetime,
};

function resolvePlanType(variantId: string): string | null {
  const entry = Object.entries(VARIANT_MAP).find(([, v]) => v === variantId);
  return entry ? entry[0] : null;
}

function calcEndDate(planType: string): Date | null {
  const now = new Date();
  switch (planType) {
    case "MONTHLY": return new Date(now.setMonth(now.getMonth() + 1));
    case "YEARLY": return new Date(now.setFullYear(now.getFullYear() + 1));
    case "LIFETIME": return null;
    default: return null;
  }
}

export namespace PaymentsService {
  export async function createCheckout(userId: string, input: CreateCheckoutInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const variantId = VARIANT_MAP[input.planType];
    if (!variantId) throw new AppError("Invalid plan type", 400);

    const successUrl = input.successUrl || `${env.clientUrl}/payment/success`;
    const cancelUrl = input.cancelUrl || `${env.clientUrl}/#pricing`;

    const checkout = await LemonSqueezy.createCheckout(variantId, {
      email: user.email || undefined,
      custom: { userId: user.id, planType: input.planType },
      redirectUrl: successUrl,
    });

    return { url: checkout.url, id: checkout.id };
  }

  export async function handleWebhook(rawBody: string, signature: string, body: any) {
    const eventName = body?.meta?.event_name;
    if (!eventName) return;

    if (signature && !LemonSqueezy.verifyWebhook(rawBody, signature)) {
      console.error("LS webhook signature verification failed");
      return;
    }

    const eventId = body?.meta?.test_mode
      ? `test-${Date.now()}`
      : `${eventName}-${body?.data?.id}`;

    const already = await prisma.lemonSqueezyEvent.findUnique({ where: { id: eventId } });
    if (already?.processed) return;

    if (!already) {
      await prisma.lemonSqueezyEvent.create({
        data: { id: eventId, type: eventName, payload: body },
      });
    }

    try {
      const customData = body?.meta?.custom_data || {};
      const userId = customData.userId as string | undefined;
      if (!userId) return;

      const data = body?.data;
      const attrs = data?.attributes || {};

      switch (eventName) {
        case "subscription_created":
        case "subscription_updated": {
          const variantId = String(attrs.variant_id || "");
          const planType = resolvePlanType(variantId) || customData.planType || "MONTHLY";
          const status = attrs.status === "cancelled" ? "FREE" : planType;
          const endDate = attrs.ends_at ? new Date(attrs.ends_at) : calcEndDate(planType);

          await prisma.user.update({
            where: { id: userId },
            data: {
              lsCustomerId: String(attrs.customer_id || ""),
              lsSubscriptionId: String(data.id || ""),
              subscriptionStatus: status as any,
              subscriptionEnd: endDate,
            },
          });

          sendToUser(userId, {
            type: "subscription_updated",
            data: { subscriptionStatus: status },
          });

          if (eventName === "subscription_created") {
            await prisma.payment.upsert({
              where: { lsOrderId: String(data.id) },
              update: { status: "SUCCEEDED" },
              create: {
                userId,
                lsOrderId: String(data.id),
                lsSubscriptionId: String(data.id),
                amount: attrs.total || 0,
                status: "SUCCEEDED",
                planType: planType as any,
              },
            });
          }
          break;
        }

        case "subscription_cancelled": {
          await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: "FREE", subscriptionEnd: null },
          });
          sendToUser(userId, {
            type: "subscription_updated",
            data: { subscriptionStatus: "FREE" },
          });
          break;
        }

        case "order_created": {
          if (attrs.status === "paid") {
            const variantId = String(attrs.first_subscription_item?.variant_id || "");
            const planType = resolvePlanType(variantId) || "LIFETIME";

            await prisma.user.update({
              where: { id: userId },
              data: {
                lsCustomerId: String(attrs.customer_id || ""),
                subscriptionStatus: planType as any,
                subscriptionEnd: null,
              },
            });

            sendToUser(userId, {
              type: "payment_success",
              data: { subscriptionStatus: planType },
            });

            await prisma.payment.create({
              data: {
                userId,
                lsOrderId: String(data.id),
                amount: attrs.total_usd ? Math.round(attrs.total_usd * 100) : 0,
                status: "SUCCEEDED",
                planType: planType as any,
              },
            });
          }
          break;
        }
      }

      await prisma.lemonSqueezyEvent.update({
        where: { id: eventId },
        data: { processed: true, processedAt: new Date() },
      });
    } catch (err) {
      console.error("Webhook processing error:", err);
    }
  }

  export async function getSubscription(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const isExpired = user.subscriptionEnd && user.subscriptionEnd < new Date()
      && user.subscriptionStatus !== "LIFETIME";

    return {
      subscriptionStatus: isExpired ? "FREE" : user.subscriptionStatus,
      subscriptionEnd: user.subscriptionEnd?.toISOString() || null,
      lsCustomerId: user.lsCustomerId,
      lsSubscriptionId: user.lsSubscriptionId,
    };
  }

  export async function getHistory(userId: string, all?: boolean) {
    const where = all ? {} : { userId };
    return prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: all ? { user: { select: { id: true, email: true, name: true } } } : undefined,
    });
  }

  export async function createCustomerPortal(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    if (!user.lsCustomerId) throw new AppError("No Lemon Squeezy customer found", 400);

    const url = await LemonSqueezy.getCustomerPortalUrl(user.lsCustomerId);
    return { url };
  }

  export async function cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    if (!user.lsSubscriptionId) throw new AppError("No active subscription found", 400);
    if (user.subscriptionStatus !== "MONTHLY" && user.subscriptionStatus !== "YEARLY") {
      throw new AppError("Only monthly/yearly subscriptions can be cancelled", 400);
    }

    await LemonSqueezy.cancelSubscription(user.lsSubscriptionId);
    return { cancelled: true };
  }
}
