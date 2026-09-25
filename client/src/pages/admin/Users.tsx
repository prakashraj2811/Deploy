import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import * as adminService from "@/services/admin.service";
import type { AdminUserRow } from "@/services/admin.service";

const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "BLOCKED", "DEACTIVATED"];

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await adminService.listUsers({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
      setUsers(res.data);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  async function handleStatusChange(id: string, status: string) {
    await adminService.setUserStatus(id, status);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Users</h1>

      <form onSubmit={handleSearchSubmit} className="mt-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, mobile" className="input pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-48">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email / Mobile</th>
                <th className="px-4 py-3">Profile Status</th>
                <th className="px-4 py-3">Completion</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-ink-800">{u.profile?.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{u.email}<br /><span className="text-xs">{u.mobile}</span></td>
                  <td className="px-4 py-3 text-ink-500">{u.profile?.status ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-500">{u.profile?.completionPercent ?? 0}%</td>
                  <td className="px-4 py-3">
                    <select value={u.status} onChange={(e) => handleStatusChange(u.id, e.target.value)} className="input !py-1.5 text-xs">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-full text-sm ${p === page ? "bg-brand-500 text-white" : "bg-white border border-ink-200 text-ink-600"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
