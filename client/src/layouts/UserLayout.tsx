import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart, LayoutDashboard, Search, Users, Bookmark, MessageCircle, Bell, Settings, LogOut, CreditCard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import * as authService from "@/services/auth.service";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Search", to: "/search", icon: Search },
  { label: "Matches", to: "/matches", icon: Users },
  { label: "Interests", to: "/interests", icon: Heart },
  { label: "Shortlist", to: "/shortlist", icon: Bookmark },
  { label: "Messages", to: "/messages", icon: MessageCircle },
  { label: "Membership", to: "/membership", icon: CreditCard },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function UserLayout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);

  async function handleLogout() {
    try {
      await authService.logout();
    } finally {
      clearSession();
      navigate("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white lg:flex lg:flex-col">
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-ink-100 px-6 font-display text-lg font-bold text-ink-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
            <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          </span>
          Sacred Bond
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50"
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-100 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50">
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 lg:px-8">
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
              <Heart className="h-5 w-5 text-brand-500" fill="currentColor" strokeWidth={0} />
              Sacred Bond
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link to="/notifications" className="text-ink-500 hover:text-ink-800">
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
