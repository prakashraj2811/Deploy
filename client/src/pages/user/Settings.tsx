import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Monitor, Trash2 } from "lucide-react";
import * as userService from "@/services/user.service";
import * as authService from "@/services/auth.service";
import { extractErrorMessage } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";
import type { NotificationPreferences, SessionRow } from "@/services/user.service";

const TABS = ["Account", "Privacy & Notifications", "Security"] as const;

export default function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Account");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
      <div className="mt-4 flex gap-2 border-b border-ink-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-ink-500 hover:text-ink-800"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Account" && <AccountTab />}
        {tab === "Privacy & Notifications" && <NotificationsTab />}
        {tab === "Security" && <SecurityTab />}
      </div>
    </div>
  );
}

function AccountTab() {
  const [me, setMe] = useState<userService.MeResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    userService.getMe().then(setMe).catch(() => setLoadError(true));
  }, []);

  async function handleDeactivate() {
    if (!confirm("Are you sure you want to deactivate your account? You can contact support to reactivate.")) return;
    await userService.deactivateAccount();
    clearSession();
    navigate("/login");
  }

  if (loadError) return <p className="text-sm text-red-600">Could not load account details.</p>;
  if (!me) return <Loader2 className="h-5 w-5 animate-spin text-brand-500" />;

  return (
    <div className="card max-w-lg space-y-4 p-6">
      <div>
        <label className="label">Email</label>
        <p className="text-sm text-ink-800">{me.email} {me.emailVerifiedAt && <span className="badge-verified ml-1">Verified</span>}</p>
      </div>
      <div>
        <label className="label">Mobile</label>
        <p className="text-sm text-ink-800">{me.mobile} {me.mobileVerifiedAt && <span className="badge-verified ml-1">Verified</span>}</p>
      </div>
      <div className="border-t border-ink-100 pt-4">
        <button onClick={handleDeactivate} className="btn-secondary text-red-600">
          <Trash2 className="h-4 w-4" /> Deactivate Account
        </button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    userService.getNotificationPreferences().then(setPrefs).catch(() => setLoadError(true));
  }, []);

  async function toggle(key: keyof NotificationPreferences) {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await userService.updateNotificationPreferences({ [key]: updated[key] });
  }

  if (loadError) return <p className="text-sm text-red-600">Could not load notification preferences.</p>;
  if (!prefs) return <Loader2 className="h-5 w-5 animate-spin text-brand-500" />;

  const items: { key: keyof NotificationPreferences; label: string }[] = [
    { key: "emailEnabled", label: "Email notifications" },
    { key: "smsEnabled", label: "SMS notifications" },
    { key: "pushEnabled", label: "Push notifications" },
    { key: "interestAlerts", label: "Interest alerts" },
    { key: "messageAlerts", label: "New message alerts" },
    { key: "marketingEmails", label: "Marketing emails" },
  ];

  return (
    <div className="card max-w-lg divide-y divide-ink-100 p-2">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-ink-800">{item.label}</span>
          <button
            onClick={() => toggle(item.key)}
            className={`h-6 w-11 rounded-full transition-colors ${prefs[item.key] ? "bg-brand-500" : "bg-ink-200"}`}
          >
            <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${prefs[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SecurityTab() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService.listSessions().then(setSessions);
  }, []);

  async function handleRevoke(id: string) {
    await userService.revokeSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setMessage("Password changed. Please sign in again on other devices.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleChangePassword} className="card max-w-lg space-y-4 p-6">
        <h3 className="font-semibold text-ink-900">Change Password</h3>
        {message && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="label">Current Password</label>
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">New Password</label>
          <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" />
        </div>
        <button type="submit" className="btn-primary">Update Password</button>
      </form>

      <div className="card max-w-lg p-6">
        <h3 className="mb-3 font-semibold text-ink-900">Active Sessions</h3>
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-ink-700">
                <Monitor className="h-4 w-4 text-ink-400" />
                {s.userAgent?.slice(0, 40) ?? "Unknown device"}
              </span>
              <button onClick={() => handleRevoke(s.id)} className="text-xs font-medium text-red-600 hover:underline">Revoke</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
