import { apiClient } from "./apiClient";
import type { ApiSuccess } from "@/types/api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  priceCents: number;
  currency: string;
  durationDays: number;
  features: string[];
}

export async function listPlans() {
  const res = await apiClient.get<ApiSuccess<SubscriptionPlan[]>>("/subscriptions/plans");
  return res.data.data;
}

export async function getMySubscription() {
  const res = await apiClient.get<ApiSuccess<unknown>>("/subscriptions/me");
  return res.data.data;
}

export async function initiateCheckout(planId: string) {
  const res = await apiClient.post<ApiSuccess<{ userSubscriptionId: string; paymentId: string; providerOrderId: string; amountCents: number; currency: string }>>(
    "/subscriptions/checkout",
    { planId }
  );
  return res.data.data;
}

export async function verifyCheckout(input: { paymentId: string; providerPaymentId: string; signature: string }) {
  const res = await apiClient.post<ApiSuccess<{ verified: boolean; expiresAt: string }>>("/subscriptions/checkout/verify", input);
  return res.data.data;
}

export async function getPaymentHistory() {
  const res = await apiClient.get<ApiSuccess<unknown[]>>("/subscriptions/payments");
  return res.data.data;
}
