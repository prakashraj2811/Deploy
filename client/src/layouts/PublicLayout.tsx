import { Link, Outlet, useNavigate } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { label: "Search Profiles", to: "/search" },
  { label: "Membership Plans", to: "/membership" },
  { label: "Success Stories", to: "/success-stories" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About Us", to: "/about" },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
              <Heart className="h-4 w-4" fill="currentColor" strokeWidth={0} />
            </span>
            Sacred Bond
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-600">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {accessToken ? (
              <button className="btn-primary" onClick={() => navigate("/dashboard")}>
                My Dashboard
              </button>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate("/login")}>
                  Sign In
                </button>
                <button className="btn-primary" onClick={() => navigate("/register")}>
                  Register Free
                </button>
              </>
            )}
          </div>

          <button className="lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-ink-100 bg-white px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} className="text-sm font-medium text-ink-700" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => navigate("/login")}>
                  Sign In
                </button>
                <button className="btn-primary flex-1" onClick={() => navigate("/register")}>
                  Register
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-100 bg-ink-900 text-ink-200">
        <div className="container-page grid grid-cols-2 gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
              <Heart className="h-4 w-4 text-brand-400" fill="currentColor" strokeWidth={0} />
              Sacred Bond
            </div>
            <p className="text-sm text-ink-400">Helping families find trusted, lifelong companionship since day one.</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
              <li><Link to="/safety-guidelines" className="hover:text-white">Safety Guidelines</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-sm text-ink-400">
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-white">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-ink-500">
          © {new Date().getFullYear()} Sacred Bond. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
