import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";
import { sendToUser } from "../../lib/websocket";
import type { CreateCheckoutInput } from "./payments.schema";
import type { PlanType, SubscriptionStatus } from "@prisma/client";

const PLAN_TO_SUBSCRIPTION: Record<string, SubscriptionStatus> = {
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  LIFETIME: "LIFETIME",
};

const PLAN_ORDER: Record<string, number> = { MONTHLY: 1, YEARLY: 2, LIFETIME: 3 };

// ─── Event logging + idempotency ────────────────────────────────────────────

async function logEvent(event: { id: string; type: string; data: { object: any } }) {
  await prisma.stripeEvent.upsert({
    where: { id: event.id },
    update: {},
    create: {
      id: event.id,
      type: event.type,
      payload: event.data.object as any,
    },
  });
}

async function markProcessed(eventId: string) {
  await prisma.stripeEvent.update({
    where: { id: eventId },
    data: { processed: true, processedAt: new Date() },
  });
}

async function isProcessed(eventId: string): Promise<boolean> {
  const existing = await prisma.stripeEvent.findUnique({ where: { id: eventId } });
  return existing?.processed === true;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getPlanByType(planType: string) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { planType: planType as any } });
  if (!plan) throw new AppError("Invalid plan type", 400);
  return plan;
}

async function ensurePriceId(planType: string): Promise<string> {
  // 1. Check if already have price ID (fast path)
  let plan = await prisma.subscriptionPlan.findUnique({ where: { planType: planType as any } });
  if (!plan) throw new AppError("Invalid plan type", 400);
  if (plan.stripePriceId) return plan.stripePriceId;

  // 2. Re-check atomically — handles race condition from concurrent requests
  const recheck = await prisma.subscriptionPlan.findUnique({ where: { planType: planType as any } });
  if (recheck?.stripePriceId) return recheck.stripePriceId;

  // 3. Find or create product on Stripe
  const products = await stripe.products.list({ limit: 100, active: true });
  let product = products.data.find((p) => p.name === plan.name);
  if (!product) {
    product = await stripe.products.create({
      name: plan.name,
      description: `Thinker — ${planType.toLowerCase()} subscription plan`,
    });
  }

  // 4. Find or create price on Stripe
  const existingPrices = await stripe.prices.list({ product: product.id, limit: 1, active: true });
  const priceId = existingPrices.data.length > 0
    ? existingPrices.data[0].id
    : (await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: "usd",
        recurring: planType === "LIFETIME" ? undefined : { interval: (plan.interval || "month") as "month" | "year" },
      })).id;

  // 5. Atomic save — only set if still null (prevents overwriting concurrent writes)
  const { count } = await prisma.subscriptionPlan.updateMany({
    where: { planType: planType as any, stripePriceId: null },
    data: { stripePriceId: priceId },
  });

  if (count === 0) {
    // Another request already set it — use theirs
    const updated = await prisma.subscriptionPlan.findUnique({ where: { planType: planType as any } });
    return updated!.stripePriceId!;
  }

  return priceId;
}

async function resolvePlanType(subscription: any): Promise<string | null> {
  if (subscription.metadata?.planType && PLAN_TO_SUBSCRIPTION[subscription.metadata.planType]) {
    return subscription.metadata.planType;
  }
  try {
    const item = subscription.items?.data?.[0];
    if (item?.price?.id) {
      const plan = await prisma.subscriptionPlan.findFirst({ where: { stripePriceId: item.price.id } });
      if (plan) return plan.planType;
    }
  } catch {}
  return null;
}

async function syncUserFromSubscription(userId: string, subscription: any) {
  const planType = await resolvePlanType(subscription);
  const isActive = subscription.status === "active" || subscription.status === "trialing";
  if (!isActive || !planType) return;

  // Never downgrade — only upgrade or stay same
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionStatus: true } });
  if (!user) return;
  const newOrder = PLAN_ORDER[planType] || 0;
  const currentOrder = PLAN_ORDER[user.subscriptionStatus] || 0;
  if (newOrder <= currentOrder) return;

  const end = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: PLAN_TO_SUBSCRIPTION[planType],
      subscriptionEnd: end,
      stripeSubscriptionId: subscription.id,
    },
  });

  sendToUser(userId, {
    type: "subscription_updated",
    subscriptionStatus: PLAN_TO_SUBSCRIPTION[planType],
    subscriptionEnd: end?.toISOString(),
  });
}

async function setUserFree(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionStatus: "FREE", stripeSubscriptionId: null, subscriptionEnd: null },
  });
  sendToUser(userId, { type: "subscription_canceled" });
}

// ─── Service ────────────────────────────────────────────────────────────────

export namespace PaymentsService {

  export async function upgradeSubscription(userId: string, newPlanType: PlanType) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const currentPlan = user.subscriptionStatus;
    if (currentPlan === "FREE") throw new AppError("No subscription to upgrade", 400);
    if (currentPlan === newPlanType) throw new AppError("Already on this plan", 400);
    if (PLAN_ORDER[newPlanType] <= PLAN_ORDER[currentPlan]) {
      throw new AppError("Cannot downgrade", 400);
    }
    if (!user.stripeCustomerId) throw new AppError("No Stripe customer found", 400);

    // All upgrades go through Stripe Checkout — payment BEFORE upgrade
    const currentPrice = (await getPlanByType(currentPlan)).price;
    const newPlan = await getPlanByType(newPlanType);
    const diff = newPlan.price - currentPrice;

    // Ensure Stripe price ID exists for the new plan (needed for subscription creation later)
    if (newPlanType !== "LIFETIME") {
      await ensurePriceId(newPlanType);
    }
    if (diff <= 0) throw new AppError("No payment needed", 400);

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `Upgrade to ${newPlan.name}` },
          unit_amount: diff,
        },
        quantity: 1,
      }],
      success_url: `${env.clientUrl}/payment/success`,
      cancel_url: `${env.clientUrl}/#pricing`,
      metadata: { userId, planType: newPlanType, isUpgrade: "true", previousPlan: currentPlan },
    });

    return { url: session.url, sessionId: session.id, prorated: true, diff };
  }

  export async function createCheckoutSession(userId: string, input: CreateCheckoutInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const priceId = await ensurePriceId(input.planType);

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId } });
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

    // Log first (always) — for audit/debugging
    await logEvent(event);

    // Idempotency check — skip if already processed
    if (await isProcessed(event.id)) {
      return { received: true, deduplicated: true };
    }

    const { id: eventId, type } = event;
    const data = event.data.object as any;

    try {
      switch (type) {

        case "checkout.session.completed": {
          const userId = data.metadata?.userId;
          const planType = data.metadata?.planType as PlanType | undefined;
          if (!userId || !planType) break;

          const subscriptionStatus = PLAN_TO_SUBSCRIPTION[planType] || "MONTHLY";

          let stripeSubscriptionId: string | null = null;
          let subscriptionEnd: Date | null = null;

          if (data.mode === "subscription" && data.subscription) {
            const subscription = await stripe.subscriptions.retrieve(data.subscription as string);
            stripeSubscriptionId = subscription.id;
            subscriptionEnd = subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null;
          }

          // Upgrade: cancel old subs at period end, create new subscription for recurring plans
          if (data.metadata?.isUpgrade === "true") {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { stripeCustomerId: true },
            });
            if (user?.stripeCustomerId) {
              // 1. Cancel old subs at period end (prevents immediate deletion webhook from downgrading)
              const oldSubs = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: "all",
                limit: 10,
              });
              for (const sub of oldSubs.data) {
                if (sub.id !== stripeSubscriptionId && sub.status !== "canceled" && sub.status !== "incomplete_expired") {
                  await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
                }
              }

              // 2. For recurring plan upgrades (Monthly→Yearly), create a real subscription with trial
              //    The user already paid the price diff via checkout, so we give them the first period free
              if (planType !== "LIFETIME" && !stripeSubscriptionId) {
                const newPlan = await getPlanByType(planType);
                if (newPlan.stripePriceId) {
                  const trialDays = newPlan.interval === "year" ? 366 : 31;
                  const newSub = await stripe.subscriptions.create({
                    customer: user.stripeCustomerId,
                    items: [{ price: newPlan.stripePriceId }],
                    trial_period_days: trialDays,
                    proration_behavior: "none",
                    metadata: { userId, planType, isUpgrade: "true", previousPlan: data.metadata.previousPlan || "" },
                  });
                  stripeSubscriptionId = newSub.id;
                  subscriptionEnd = newSub.trial_end
                    ? new Date(newSub.trial_end * 1000)
                    : null;
                }
              }
            }
          }

          // Ensure subscription metadata has planType
          if (data.mode === "subscription" && data.subscription) {
            await stripe.subscriptions.update(data.subscription as string, {
              metadata: { userId, planType, ...(data.metadata?.isUpgrade ? { isUpgrade: "true", previousPlan: data.metadata.previousPlan } : {}) },
            });
          }

          await Promise.all([
            prisma.payment.upsert({
              where: { stripePaymentId: data.id },
              update: {},
              create: {
                userId,
                stripePaymentId: data.id,
                stripeSubscriptionId,
                amount: data.amount_total || 0,
                currency: data.currency || "usd",
                status: "SUCCEEDED",
                planType,
              },
            }),
            prisma.user.update({
              where: { id: userId },
              data: { subscriptionStatus, subscriptionEnd, stripeSubscriptionId },
            }),
          ]);

          sendToUser(userId, { type: "payment_success", planType, subscriptionStatus });
          break;
        }

        case "checkout.session.expired": {
          const userId = data.metadata?.userId;
          const planType = data.metadata?.planType as PlanType | undefined;
          if (!userId || !planType) break;

          // Log the abandoned checkout — user can retry
          await prisma.payment.upsert({
            where: { stripePaymentId: data.id },
            update: {},
            create: {
              userId,
              stripePaymentId: data.id,
              amount: data.amount_total || 0,
              currency: data.currency || "usd",
              status: "FAILED",
              planType,
            },
          });
          break;
        }

        case "invoice.paid": {
          const subscriptionId = data.subscription as string;
          if (!subscriptionId) break;

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          let user = await prisma.user.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
          if (!user) {
            user = await prisma.user.findUnique({ where: { stripeCustomerId: subscription.customer as string } });
            if (!user) break;
          }

          await syncUserFromSubscription(user.id, subscription);

          const planType = await resolvePlanType(subscription);
          if (planType && data.amount_paid > 0 && data.id) {
            await prisma.payment.upsert({
              where: { stripePaymentId: `invoice_${data.id}` },
              update: {},
              create: {
                userId: user.id,
                stripePaymentId: `invoice_${data.id}`,
                stripeSubscriptionId: subscriptionId,
                amount: data.amount_paid,
                currency: data.currency || "usd",
                status: "SUCCEEDED",
                planType: planType as PlanType,
              },
            });
          }
          break;
        }

        case "invoice.payment_failed": {
          const failedSubId = data.subscription as string;
          if (!failedSubId) break;

          let user = await prisma.user.findUnique({ where: { stripeSubscriptionId: failedSubId } });
          if (!user) {
            user = await prisma.user.findUnique({ where: { stripeCustomerId: data.customer as string } });
            if (!user) break;
          }

          // Notify user
          sendToUser(user.id, {
            type: "payment_failed",
            message: "Payment failed. Please update your payment method.",
          });

          // Record the failed payment
          if (data.id && data.amount_due > 0) {
            await prisma.payment.upsert({
              where: { stripePaymentId: `invoice_${data.id}` },
              update: { status: "FAILED" },
              create: {
                userId: user.id,
                stripePaymentId: `invoice_${data.id}`,
                stripeSubscriptionId: failedSubId,
                amount: data.amount_due,
                currency: data.currency || "usd",
                status: "FAILED",
                planType: user.subscriptionStatus as PlanType,
              },
            });
          }

          // Stripe auto-retries — don't downgrade immediately
          // Grace period is handled by Stripe's built-in dunning
          break;
        }

        case "customer.subscription.updated": {
          const sub = data;

          // Skip pending updates (payment not confirmed yet)
          if (sub.pending_update) break;

          let user = await prisma.user.findUnique({ where: { stripeSubscriptionId: sub.id } });
          if (!user) {
            user = await prisma.user.findUnique({ where: { stripeCustomerId: sub.customer as string } });
            if (!user) break;
          }

          // Don't overwrite a higher plan that was set via checkout.session.completed
          const subPlanType = await resolvePlanType(sub);
          if (subPlanType && (PLAN_ORDER[user.subscriptionStatus] || 0) > (PLAN_ORDER[subPlanType] || 0)) break;

          const isActive = sub.status === "active" || sub.status === "trialing";
          const isTerminal = sub.status === "canceled" || sub.status === "unpaid" || sub.status === "incomplete_expired";

          if (isActive) {
            await syncUserFromSubscription(user.id, sub);
          } else if (isTerminal) {
            // Only downgrade on terminal statuses — not past_due (Stripe dunning retries)
            if (user.subscriptionStatus === "LIFETIME") break;
            // Skip if this sub was created as an upgrade (user already paid via checkout)
            if (sub.metadata?.isUpgrade === "true") break;
            await setUserFree(user.id);
          }
          // past_due → don't downgrade, Stripe is retrying
          break;
        }

        case "customer.subscription.deleted": {
          const sub = data;

          let user = await prisma.user.findUnique({ where: { stripeSubscriptionId: sub.id } });
          if (!user) {
            user = await prisma.user.findUnique({ where: { stripeCustomerId: sub.customer as string } });
            if (!user) break;
          }

          // Only downgrade if user's current plan is LOWER than what the subscription offered
          const subPlanType = await resolvePlanType(sub);
          if (subPlanType && (PLAN_ORDER[user.subscriptionStatus] || 0) > (PLAN_ORDER[subPlanType] || 0)) break;
          if (user.subscriptionStatus === "LIFETIME") break;
          // Skip if this sub was created as an upgrade (user already paid via checkout)
          if (sub.metadata?.isUpgrade === "true") break;
          await setUserFree(user.id);
          break;
        }
      }

      await markProcessed(eventId);
      return { received: true };
    } catch (err) {
      console.error(`Webhook error [${eventId}] ${type}:`, err);
      // Don't mark as processed — Stripe will retry
      throw err;
    }
  }

  export async function getSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionEnd: true, stripeCustomerId: true, stripeSubscriptionId: true },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  export async function getReceipts(userId: string) {
    const payments = await prisma.payment.findMany({
      where: { userId, status: "SUCCEEDED" },
      orderBy: { createdAt: "desc" },
    });

    const receipts = await Promise.all(
      payments.map(async (p) => {
        try {
          let invoiceUrl = "";

          if (p.stripePaymentId.startsWith("cs_")) {
            const session = await stripe.checkout.sessions.retrieve(p.stripePaymentId);
            if (session.invoice) {
              const invoice = await stripe.invoices.retrieve(session.invoice as string);
              invoiceUrl = invoice.hosted_invoice_url || "";
            } else if (session.payment_intent) {
              const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string);
              const chargeId = pi.latest_charge;
              if (chargeId) {
                const charge = await stripe.charges.retrieve(chargeId as string);
                invoiceUrl = charge.receipt_url || "";
              }
            }
          } else if (p.stripePaymentId.startsWith("invoice_")) {
            const invoiceId = p.stripePaymentId.replace("invoice_", "");
            const invoice = await stripe.invoices.retrieve(invoiceId);
            invoiceUrl = invoice.hosted_invoice_url || "";
          }

          return {
            id: p.id,
            planType: p.planType,
            amount: p.amount,
            currency: p.currency,
            date: p.createdAt,
            invoiceUrl,
          };
        } catch {
          return {
            id: p.id,
            planType: p.planType,
            amount: p.amount,
            currency: p.currency,
            date: p.createdAt,
            invoiceUrl: "",
          };
        }
      })
    );

    return receipts.filter((r) => r.invoiceUrl);
  }

  export async function createPortalSession(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) throw new AppError("No Stripe customer found", 400);
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.clientUrl}/dashboard`,
    });
    return { url: session.url };
  }

  export async function getHistory(userId: string, all?: boolean) {
    const mapPayment = (p: any) => {
      const isCheckout = p.stripePaymentId?.startsWith("cs_");
      const isInvoice = p.stripePaymentId?.startsWith("invoice_");
      let description = "";
      if (isCheckout) {
        description = p.status === "SUCCEEDED" ? "New Membership" : "Expired Checkout";
      } else if (isInvoice) {
        description = p.status === "SUCCEEDED" ? "Renewal" : "Failed Renewal";
      } else {
        description = "Payment";
      }
      description += ` · ${p.planType?.charAt(0) + p.planType?.slice(1).toLowerCase() || ""}`;
      return { ...p, description };
    };

    if (all) {
      const payments = await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      });
      return payments.map(mapPayment);
    }
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return payments.map(mapPayment);
  }
}
