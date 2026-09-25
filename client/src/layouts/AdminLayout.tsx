import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Shield, LayoutDashboard, Users, BadgeCheck, Flag, LifeBuoy, CreditCard, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import * as authService from "@/services/auth.service";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Verifications", to: "/admin/verifications", icon: BadgeCheck },
  { label: "Reports", to: "/admin/reports", icon: Flag },
  { label: "Support", to: "/admin/support", icon: LifeBuoy },
  { label: "Subscriptions", to: "/admin/subscriptions", icon: CreditCard },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();

  async function handleLogout() {
    try {
      await authService.logout();
    } finally {
      clearSession();
      navigate("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-100" style={{ backgroundColor: "#161821" }}>
      <aside className="hidden w-64 shrink-0 border-r border-white/10 lg:flex lg:flex-col">
        <Link to="/admin" className="flex h-16 items-center gap-2 border-b border-white/10 px-6 font-display text-lg font-bold text-white">
          <Shield className="h-5 w-5 text-brand-400" />
          {user?.roles.includes("super_admin") ? "Super Admin" : "Admin Panel"}
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-ink-50 p-4 text-ink-900 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
