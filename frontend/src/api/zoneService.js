import api from "./axiosInstance";

export const zoneService = {
  /** GET /api/v1/zones */
  getAll: () => api.get("/api/v1/zones"),

  /** GET /api/v1/zones/:id */
  getById: (id) => api.get(`/api/v1/zones/${id}`),

  /** POST /api/v1/zones (admin) */
  create: (data) => api.post("/api/v1/zones", data),

  /** PUT /api/v1/zones/:id (admin) */
  update: (id, data) => api.put(`/api/v1/zones/${id}`, data),

  /** DELETE /api/v1/zones/:id (admin) */
  delete: (id) => api.delete(`/api/v1/zones/${id}`),

  /** GET /api/v1/zones/:id_zone/stocks (admin) */
  getStocks: (id_zone) => api.get(`/api/v1/zones/${id_zone}/stocks`),
};

export const reservationService = {
  /** GET /api/v1/reservations/me */
  getMine: () => api.get("/api/v1/reservations/me"),

  /** POST /api/v1/reservations  { id_zone } */
  create: (id_zone) => api.post("/api/v1/reservations", { id_zone }),

  /** GET /api/v1/victim/dashboard */
  getDashboard: () => api.get("/api/v1/victim/dashboard"),

  /** DELETE /api/v1/reservations/me */
  cancel: () => api.delete("/api/v1/reservations/me"),
};

export const resourceService = {
  /** GET /api/v1/resources */
  getAll: () => api.get("/api/v1/resources"),
};
