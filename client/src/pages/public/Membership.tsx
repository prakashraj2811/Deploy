import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Heart } from "lucide-react";
import * as subscriptionService from "@/services/subscription.service";
import type { SubscriptionPlan } from "@/services/subscription.service";
import { useAuthStore } from "@/store/authStore";

function formatPrice(cents: number, currency: string) {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export default function MembershipPublic() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    subscriptionService
      .listPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  function handleChoose() {
    navigate(accessToken ? "/membership/checkout" : "/register");
  }

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Membership Plans</h1>
        <p className="mt-3 text-ink-500">Choose the plan that fits your journey. Upgrade or cancel anytime.</p>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : (
        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`card p-6 ${plan.slug === "premium" ? "border-brand-300 ring-2 ring-brand-200" : ""}`}>
              <h3 className="font-display text-lg font-bold text-ink-900">{plan.name}</h3>
              <p className="text-sm text-ink-500">{plan.tagline}</p>
              <p className="mt-4 font-display text-2xl font-bold text-ink-900">{formatPrice(plan.priceCents, plan.currency)}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-600">
                    <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" fill="currentColor" strokeWidth={0} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={handleChoose} className="btn-primary mt-6 w-full">Choose Plan</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
