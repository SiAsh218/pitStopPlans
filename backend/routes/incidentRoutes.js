const auth = require("../middleware/auth");

const requireRole = require("../middleware/role");

const incidentController = require("../controllers/incidentController");

module.exports = [
  /**
   * Get all incidents
   */
  {
    method: "GET",
    path: "/api/incidents",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      incidentController.getAll.bind(incidentController),
    ],
  },

  /**
   * Get incident by id
   */
  {
    method: "GET",
    path: "/api/incidents/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      incidentController.getById.bind(incidentController),
    ],
  },

  /**
   * Create incident
   */
  {
    method: "POST",
    path: "/api/incidents",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      incidentController.create.bind(incidentController),
    ],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/close",
    handler: [
      auth,
      requireRole("admin", "editor"),
      incidentController.close.bind(incidentController),
    ],
  },
  {
    method: "GET",
    path: "/api/incidents/:id/dashboard",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      incidentController.dashboard.bind(incidentController),
    ],
  },
];
