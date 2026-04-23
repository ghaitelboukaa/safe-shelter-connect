import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Route Guards
import {
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  VictimRoute,
  GuestRoute,
} from "./routes/ProtectedRoute";

// Layouts
import { PublicLayout } from "./components/shared/PublicLayout";
import { VictimLayout } from "./components/shared/VictimLayout";
import { AdminLayout } from "./components/shared/AdminLayout";

// Pages
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import PublicZonesPage from "./pages/Public/PublicZonesPage";
import VictimDashboardPage from "./pages/Victim/VictimDashboardPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminReservationsPage from "./pages/Admin/AdminReservationsPage";
import AdminZonesPage from "./pages/Admin/AdminZonesPage";
import AdminLogisticsPage from "./pages/Admin/AdminLogisticsPage";
import AdminUserManager from "./pages/Admin/AdminUserManager";
import TeamManagementPage from "./pages/Admin/TeamManagementPage";
import VictimDirectoryPage from "./pages/Admin/VictimDirectoryPage";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        expand
        closeButton
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            borderRadius: "0.75rem",
          },
        }}
      />

      <Routes>
        {/* ── Public routes ─────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/zones" element={<PublicZonesPage />} />
        </Route>

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Victim portal ─────────────────────────────────────── */}
        <Route element={<VictimRoute />}>
          <Route element={<VictimLayout />}>
            <Route path="/victim/portal" element={<VictimDashboardPage />} />
          </Route>
        </Route>

        {/* ── Admin portal (Shared) ─────────────────────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/reservations" element={<AdminReservationsPage />} />
            <Route path="/admin/logistics" element={<AdminLogisticsPage />} />
            <Route path="/admin/teams" element={<TeamManagementPage />} />
            <Route path="/admin/victims" element={<VictimDirectoryPage />} />

            {/* ── Super Admin Only ─────────────────────────────── */}
            <Route element={<SuperAdminRoute />}>
              <Route path="/admin/zones" element={<AdminZonesPage />} />
              <Route path="/admin/users" element={<AdminUserManager />} />
            </Route>
          </Route>
        </Route>

        {/* ── Fallback ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
