import api from "./axiosInstance";

export const authService = {
  /**
   * POST /api/v1/auth/register
   * @param {{ email, password, nom, prenom, cin }} data
   */
  register: (data) => api.post("/api/v1/auth/register", data),

  /**
   * POST /api/v1/auth/login
   * @param {{ email, password }} data
   * @returns { access_token, role, message }
   */
  login: (data) => api.post("/api/v1/auth/login", data),

  /**
   * POST /api/v1/auth/logout
   */
  logout: () => api.post("/api/v1/auth/logout"),
};
