import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Route Guards
import {
  ProtectedRoute,
  AdminRoute,
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
import VictimPortalPage from "./pages/Victim/VictimPortalPage";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminReservationsPage from "./pages/Admin/AdminReservationsPage";
import AdminZonesPage from "./pages/Admin/AdminZonesPage";
import AdminLogisticsPage from "./pages/Admin/AdminLogisticsPage";

export default function App() {
  return (
    <>
      {/* Global sonner toast container */}
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
        {/* ── Public routes (landing + auth) ───────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* ── Guest-only routes (redirect if already logged in) ── */}
        <Route element={<GuestRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ── Victim portal ─────────────────────────────────────── */}
        <Route element={<VictimRoute />}>
          <Route element={<VictimLayout />}>
            <Route path="/victim/portal" element={<VictimPortalPage />} />
          </Route>
        </Route>

        {/* ── Admin portal ──────────────────────────────────────── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard"    element={<AdminDashboardPage />} />
            <Route path="/admin/reservations" element={<AdminReservationsPage />} />
            <Route path="/admin/zones"        element={<AdminZonesPage />} />
            <Route path="/admin/logistics"    element={<AdminLogisticsPage />} />
          </Route>
        </Route>

        {/* ── Fallback ──────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
