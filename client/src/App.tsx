import { Route, Routes } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import UserLayout from "@/layouts/UserLayout";
import AdminLayout from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import Home from "@/pages/public/Home";
import StaticPage from "@/pages/public/StaticPage";
import MembershipPublic from "@/pages/public/Membership";
import SearchPage from "@/pages/public/SearchPage";
import NotFound from "@/pages/public/NotFound";
import Forbidden from "@/pages/public/Forbidden";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

import Dashboard from "@/pages/user/Dashboard";
import Onboarding from "@/pages/user/Onboarding";
import Matches from "@/pages/user/Matches";
import Interests from "@/pages/user/Interests";
import Shortlist from "@/pages/user/Shortlist";
import Messages from "@/pages/user/Messages";
import Membership from "@/pages/user/Membership";
import Notifications from "@/pages/user/Notifications";
import Settings from "@/pages/user/Settings";
import ProfileView from "@/pages/user/ProfileView";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminVerifications from "@/pages/admin/Verifications";
import AdminReports from "@/pages/admin/Reports";
import AdminSupport from "@/pages/admin/Support";
import AdminSubscriptions from "@/pages/admin/Subscriptions";

const STATIC_PAGES: { path: string; title: string }[] = [
  { path: "about", title: "About Us" },
  { path: "how-it-works", title: "How It Works" },
  { path: "success-stories", title: "Success Stories" },
  { path: "contact", title: "Contact Us" },
  { path: "faq", title: "Frequently Asked Questions" },
  { path: "blog", title: "Blog" },
  { path: "privacy-policy", title: "Privacy Policy" },
  { path: "terms", title: "Terms & Conditions" },
  { path: "refund-policy", title: "Refund Policy" },
  { path: "community-guidelines", title: "Community Guidelines" },
  { path: "safety-guidelines", title: "Safety Guidelines" },
];

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/membership" element={<MembershipPublic />} />
        {STATIC_PAGES.map((page) => (
          <Route key={page.path} path={`/${page.path}`} element={<StaticPage title={page.title} />} />
        ))}
        <Route path="/403" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/interests" element={<Interests />} />
          <Route path="/shortlist" element={<Shortlist />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/membership/checkout" element={<Membership />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profiles/:id" element={<ProfileView />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requirePermission="admin.dashboard.view" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/verifications" element={<AdminVerifications />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
        </Route>
      </Route>
    </Routes>
  );
}
