import { useEffect, useState } from "react";
import { Loader2, LifeBuoy } from "lucide-react";
import * as supportService from "@/services/support.service";
import type { TicketRow } from "@/services/support.service";

const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED"];
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-ink-100 text-ink-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-amber-50 text-amber-700",
  CRITICAL: "bg-red-50 text-red-700",
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setTickets(await supportService.listTickets());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id: string, status: string) {
    await supportService.updateTicket(id, { status });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Support Tickets</h1>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : tickets.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <LifeBuoy className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No support tickets.</p>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{t.subject}</td>
                  <td className="px-4 py-3 text-ink-500">{t.user?.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${PRIORITY_COLORS[t.priority] ?? "bg-ink-100 text-ink-600"}`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={t.status} onChange={(e) => handleStatusChange(t.id, e.target.value)} className="input !py-1.5 text-xs">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
