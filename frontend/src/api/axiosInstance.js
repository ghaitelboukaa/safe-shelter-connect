import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = "http://127.0.0.1:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor: attach JWT token to every request ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: handle global errors ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || "An unexpected error occurred.";
    const errorCode = data?.error;

    switch (status) {
      case 401:
        // Token expired or invalid → force logout
        if (window.location.pathname !== "/login") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_role");
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
        break;

      case 403:
        toast.error("Access Denied: " + message);
        break;

      case 404:
        if (errorCode !== "double_booking" && errorCode !== "not_found") {
          // Silent 404 for reservation checks
        }
        break;

      case 409:
        toast.error(`⚠️ ${message}`, {
          description: "You already have an active reservation.",
        });
        break;

      case 422:
        toast.error(`📦 Insufficient Stock`, {
          description: message,
        });
        break;

      case 400:
        toast.error(message);
        break;

      case 500:
        toast.error("Server Error. Please try again later.");
        break;

      default:
        if (status) {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

export default api;
