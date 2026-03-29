import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ── Require any logged-in user ─────────────────────────────────────────────
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ── Require admin role ─────────────────────────────────────────────────────
export function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/victim/portal" replace />;
  return <Outlet />;
}

// ── Require super_admin role ───────────────────────────────────────────────
export function SuperAdminRoute() {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

// ── Require sinistre role ──────────────────────────────────────────────────
export function VictimRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}

// ── Redirect already-logged-in users away from auth pages ─────────────────
export function GuestRoute() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/victim/portal"} replace />;
  }
  return <Outlet />;
}
