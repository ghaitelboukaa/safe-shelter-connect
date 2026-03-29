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

  /** POST /api/v1/admin/teams */
  createTeam: (data) => api.post("/api/v1/admin/teams", data),

  /** PUT /api/v1/admin/teams/:id */
  updateTeam: (id, data) => api.put(`/api/v1/admin/teams/${id}`, data),

  /** DELETE /api/v1/admin/teams/:id */
  deleteTeam: (id) => api.delete(`/api/v1/admin/teams/${id}`),

  /** GET /api/v1/zones/:id_zone/stocks */
  getZoneStocks: (id_zone) => api.get(`/api/v1/zones/${id_zone}/stocks`),

  /** POST /api/v1/admin/zones/:id_zone/stocks (Restock) */
  restock: (id_zone, id_ressource, quantite) => 
    api.post(`/api/v1/admin/zones/${id_zone}/stocks`, { id_ressource, quantite }),

  /** GET /api/v1/resources (Catalog) */
  getResources: () => api.get("/api/v1/resources"),

  /** POST /api/v1/admin/resources */
  createResource: (data) => api.post("/api/v1/admin/resources", data),

  /** GET /api/v1/admin/victims */
  getVictims: (page = 1) => api.get(`/api/v1/admin/victims?page=${page}`),

  /** POST /api/v1/admin/users (Create Admin/Equipe) */
  createUser: (data) => api.post("/api/v1/admin/users", data),
};
