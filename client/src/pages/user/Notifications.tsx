import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import * as userService from "@/services/user.service";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export default function Notifications() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getNotifications()
      .then((data) => setItems(data as NotificationRow[]))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkAllRead() {
    await userService.markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Notifications</h1>
        <button onClick={handleMarkAllRead} className="btn-secondary text-sm">Mark all read</button>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>
      ) : items.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <Bell className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {items.map((n) => (
            <div key={n.id} className={`card flex items-start gap-3 p-4 ${!n.readAt ? "border-brand-200 bg-brand-50/40" : ""}`}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.readAt ? "bg-brand-500" : "bg-transparent"}`} />
              <div>
                <p className="font-semibold text-ink-900">{n.title}</p>
                <p className="text-sm text-ink-500">{n.body}</p>
                <p className="mt-1 text-xs text-ink-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
