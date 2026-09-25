import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { apiClient, extractErrorMessage } from "@/services/apiClient";
import * as subscriptionService from "@/services/subscription.service";
import type { SubscriptionPlan } from "@/services/subscription.service";

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(cents / 100);
}

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setPlans(await subscriptionService.listPlans());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await apiClient.post("/subscriptions/plans", {
        name: fd.get("name"),
        slug: fd.get("slug"),
        tagline: fd.get("tagline") || undefined,
        priceCents: Number(fd.get("priceCents")) * 100,
        durationDays: Number(fd.get("durationDays")),
        features: String(fd.get("features") || "").split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleDeactivate(id: string) {
    await apiClient.delete(`/subscriptions/plans/${id}`);
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Subscription Plans</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mt-4 grid gap-3 p-5 sm:grid-cols-2">
          {error && <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <input name="name" required placeholder="Plan name" className="input" />
          <input name="slug" required placeholder="slug (e.g. gold)" className="input" />
          <input name="tagline" placeholder="Tagline" className="input" />
          <input name="priceCents" type="number" required placeholder="Price (INR)" className="input" />
          <input name="durationDays" type="number" required placeholder="Duration (days)" className="input" />
          <input name="features" placeholder="Features (comma-separated)" className="input sm:col-span-2" />
          <button type="submit" className="btn-primary sm:col-span-2 justify-self-start">Create Plan</button>
        </form>
      )}

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div key={plan.id} className="card p-5">
              <h3 className="font-semibold text-ink-900">{plan.name}</h3>
              <p className="text-xs text-ink-500">{plan.tagline}</p>
              <p className="mt-2 font-display text-xl font-bold text-ink-900">{formatPrice(plan.priceCents, plan.currency)}</p>
              <p className="text-xs text-ink-400">{plan.durationDays} days</p>
              <button onClick={() => handleDeactivate(plan.id)} className="btn-secondary mt-4 w-full text-xs">Deactivate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
