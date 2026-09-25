import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  requireRole?: string;
  requirePermission?: string;
}

export function ProtectedRoute({ requireRole, requirePermission }: ProtectedRouteProps) {
  const location = useLocation();
  const { accessToken, hasRole, hasPermission } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (requireRole && !hasRole(requireRole)) {
    return <Navigate to="/403" replace />;
  }
  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
