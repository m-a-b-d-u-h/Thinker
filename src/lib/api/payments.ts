import { api } from "@/lib/axios";
import type { User } from "@/lib/types";

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionInfo {
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  stripeCustomerId: string | null;
}

export interface PaymentHistory {
  id: string;
  userId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: string;
  planType: string;
  createdAt: string;
}

export type UpgradeResult = { success: true } | (CheckoutResponse & { prorated?: boolean; diff?: number });

export const paymentsApi = {
  createCheckoutSession: (planType: "MONTHLY" | "YEARLY" | "LIFETIME") =>
    api.post<CheckoutResponse>("/payments/create-checkout-session", { planType }).then(r => r.data),

  upgradeSubscription: (planType: "MONTHLY" | "YEARLY" | "LIFETIME") =>
    api.post<UpgradeResult>("/payments/upgrade", { planType }).then(r => r.data),

  verifySession: (sessionId: string) =>
    api.post<User>("/payments/verify-session", { sessionId }).then(r => r.data),

  activatePending: () =>
    api.post<User>("/payments/activate-pending").then(r => r.data),

  getSubscription: () =>
    api.get<SubscriptionInfo>("/payments/subscription").then(r => r.data),

  getHistory: () =>
    api.get<PaymentHistory[]>("/payments/history").then(r => r.data),
};
