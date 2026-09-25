import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import * as subscriptionService from "@/services/subscription.service";
import type { SubscriptionPlan } from "@/services/subscription.service";
import { extractErrorMessage } from "@/services/apiClient";

function formatPrice(cents: number, currency: string) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export default function Membership() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subscriptionService
      .listPlans()
      .then(setPlans)
      .catch(() => setError("Could not load membership plans."))
      .finally(() => setLoading(false));
  }, []);

  async function handleCheckout(plan: SubscriptionPlan) {
    setProcessingPlanId(plan.id);
    setError(null);
    try {
      const order = await subscriptionService.initiateCheckout(plan.id);
      // In production this hands off to the Razorpay Checkout widget; the mock provider
      // accepts any payment reference in sandbox mode. Backend always verifies server-side.
      await subscriptionService.verifyCheckout({
        paymentId: order.paymentId,
        providerPaymentId: `sandbox_${order.providerOrderId}`,
        signature: "sandbox_signature",
      });
      setSuccessPlan(plan.name);
    } catch (err) {
      setError(extractErrorMessage(err, "Checkout failed. Please try again."));
    } finally {
      setProcessingPlanId(null);
    }
  }

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;

  if (successPlan) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-4 text-lg font-semibold text-ink-900">You're now on {successPlan}!</h2>
        <p className="mt-2 text-sm text-ink-500">Your new plan benefits are active immediately.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Upgrade your membership</h1>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div key={plan.id} className="card p-5">
            <h3 className="font-semibold text-ink-900">{plan.name}</h3>
            <p className="text-xs text-ink-500">{plan.tagline}</p>
            <p className="mt-3 font-display text-xl font-bold text-ink-900">{formatPrice(plan.priceCents, plan.currency)}</p>
            <button
              onClick={() => handleCheckout(plan)}
              disabled={processingPlanId === plan.id || plan.priceCents === 0}
              className="btn-primary mt-4 w-full"
            >
              {processingPlanId === plan.id && <Loader2 className="h-4 w-4 animate-spin" />}
              {plan.priceCents === 0 ? "Current / Free" : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
