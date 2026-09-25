import { useEffect, useState } from "react";
import { Users, UserCheck, Clock, Ban, CreditCard, Heart, Flag, LifeBuoy } from "lucide-react";
import * as adminService from "@/services/admin.service";
import type { DashboardMetrics } from "@/services/admin.service";

const CARDS: { key: keyof DashboardMetrics; label: string; icon: typeof Users; suffix?: string }[] = [
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "activeUsers", label: "Active Users", icon: UserCheck },
  { key: "newRegistrations", label: "New (30 days)", icon: Clock },
  { key: "verifiedProfiles", label: "Verified Profiles", icon: UserCheck },
  { key: "pendingVerification", label: "Pending Verification", icon: Clock },
  { key: "suspendedUsers", label: "Suspended Users", icon: Ban },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: CreditCard },
  { key: "interestAcceptanceRate", label: "Interest Acceptance", icon: Heart, suffix: "%" },
  { key: "openReports", label: "Open Reports", icon: Flag },
  { key: "openTickets", label: "Open Tickets", icon: LifeBuoy },
];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    adminService.getDashboardMetrics().then(setMetrics);
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div key={card.key} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <card.icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900">
              {metrics ? metrics[card.key] : "—"}
              {card.suffix}
            </p>
            <p className="text-xs text-ink-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
