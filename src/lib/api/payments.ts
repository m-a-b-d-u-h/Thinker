import { api } from "@/lib/axios";

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionInfo {
  subscriptionStatus: string;
  subscriptionEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export interface PortalResponse {
  url: string;
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

export type UpgradeResult = CheckoutResponse & { prorated?: boolean; diff?: number };

export const paymentsApi = {
  createCheckoutSession: (planType: "MONTHLY" | "YEARLY" | "LIFETIME") =>
    api.post<CheckoutResponse>("/payments/create-checkout-session", { planType }).then(r => r.data),

  upgradeSubscription: (planType: "MONTHLY" | "YEARLY" | "LIFETIME") =>
    api.post<UpgradeResult>("/payments/upgrade", { planType }).then(r => r.data),

  getSubscription: () =>
    api.get<SubscriptionInfo>("/payments/subscription").then(r => r.data),

  getHistory: () =>
    api.get<PaymentHistory[]>("/payments/history").then(r => r.data),

  createPortalSession: () =>
    api.post<PortalResponse>("/payments/portal").then(r => r.data),

  getReceipts: () =>
    api.get<{ id: string; planType: string; amount: number; date: string; invoiceUrl: string }[]>("/payments/receipts").then(r => r.data),
};
