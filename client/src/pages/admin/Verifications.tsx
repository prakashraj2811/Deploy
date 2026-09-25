import { useEffect, useState } from "react";
import { Loader2, Check, X, BadgeCheck } from "lucide-react";
import * as adminService from "@/services/admin.service";

interface VerificationRequestRow {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  profile: { id: string; fullName: string; userId: string };
}

export default function AdminVerifications() {
  const [items, setItems] = useState<VerificationRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems((await adminService.listVerificationRequests("PENDING")) as VerificationRequestRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecide(id: string, approve: boolean) {
    await adminService.decideVerification(id, approve);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Pending Verifications</h1>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <BadgeCheck className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No pending verification requests.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-ink-900">{item.profile.fullName}</p>
                <p className="text-xs text-ink-500">{item.type} · Requested {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDecide(item.id, true)} className="btn-primary !px-3 !py-1.5 text-xs">
                  <Check className="h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => handleDecide(item.id, false)} className="btn-secondary !px-3 !py-1.5 text-xs text-red-600">
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
