import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../api/authService";

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    const id_zone = localStorage.getItem("user_id_zone");
    return token ? { token, role, id_zone: id_zone && id_zone !== "null" ? Number(id_zone) : null } : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      const { access_token, role, id_zone } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user_role", role);
      if (id_zone) localStorage.setItem("user_id_zone", id_zone);

      setUser({ token: access_token, role, id_zone });
      toast.success("Welcome back! You're now logged in.");

      if (role === "super_admin" || role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/victim/portal");
      }
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ── Register ───────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      await authService.register(userData);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore – still clear local state
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id_zone");
      setUser(null);
      toast.info("You've been logged out.");
      navigate("/login");
    }
  }, [navigate]);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, isAdmin, isSuperAdmin, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
