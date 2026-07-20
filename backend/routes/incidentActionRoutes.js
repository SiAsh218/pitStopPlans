const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const controller = require("../controllers/incidentActionController");

module.exports = [
  /**
   * Get actions for incident
   */
  {
    method: "GET",
    path: "/api/incidents/:incidentId/actions",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      controller.getByIncident.bind(controller),
    ],
  },

  /**
   * Get single action
   */
  {
    method: "GET",
    path: "/api/incident_actions/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      controller.getById.bind(controller),
    ],
  },

  /**
   * Start action
   */
  {
    method: "POST",
    path: "/api/incident_actions/:id/start",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      controller.start.bind(controller),
    ],
  },

  /**
   * Complete action
   */
  {
    method: "POST",
    path: "/api/incident_actions/:id/complete",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      controller.complete.bind(controller),
    ],
  },

  /**
   * Assign action
   */
  {
    method: "POST",
    path: "/api/incident_actions/:id/assign",
    handler: [
      auth,
      requireRole("admin", "editor"),
      controller.assign.bind(controller),
    ],
  },
];
