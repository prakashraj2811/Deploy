import { useEffect, useState } from "react";
import { Loader2, Flag } from "lucide-react";
import * as reportService from "@/services/report.service";
import type { ReportRow } from "@/services/report.service";

const STATUSES = ["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"];

export default function AdminReports() {
  const [items, setItems] = useState<ReportRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await reportService.listReports(statusFilter || undefined));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleStatusChange(id: string, status: string) {
    await reportService.updateReport(id, { status });
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Reports</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-48">
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <Flag className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No reports in this status.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-900">{r.reason.replace(/_/g, " ")}</p>
                <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} className="input !py-1.5 w-40 text-xs">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {r.details && <p className="mt-1 text-sm text-ink-500">{r.details}</p>}
              <p className="mt-2 text-xs text-ink-400">Filed {new Date(r.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
