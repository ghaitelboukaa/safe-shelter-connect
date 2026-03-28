import api from "./axiosInstance";

export const adminService = {
  /** GET /api/v1/admin/dashboard */
  getDashboard: () => api.get("/api/v1/admin/dashboard"),

  /** GET /api/v1/admin/reservations?page=N */
  getReservations: (page = 1) =>
    api.get(`/api/v1/admin/reservations?page=${page}`),

  /**
   * PATCH /api/v1/admin/reservations/:id
   * @param {number} id  – id_sinistre
   * @param {'Confirmed' | 'Rejected'} action
   */
  updateReservation: (id, action) =>
    api.patch(`/api/v1/admin/reservations/${id}`, { action }),

  /**
   * POST /api/v1/admin/distributions
   * @param {{ id_zone, id_ressource, id_sinistre, quantite_donnee, unite_mesure }} data
   */
  recordDistribution: (data) => api.post("/api/v1/admin/distributions", data),

  /** GET /api/v1/admin/teams */
  getTeams: () => api.get("/api/v1/admin/teams"),

  /** GET /api/v1/zones/:id_zone/stocks */
  getZoneStocks: (id_zone) => api.get(`/api/v1/zones/${id_zone}/stocks`),
};
