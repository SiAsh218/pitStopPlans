const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const controller = require("../controllers/incidentActionUpdateController");

module.exports = [
  /**
   * Get updates for an action.
   */
  {
    method: "GET",
    path: "/api/incident_actions/:id/updates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      controller.getByAction,
    ],
  },

  /**
   * Add comment/update.
   */
  {
    method: "POST",
    path: "/api/incident_actions/:id/updates",
    handler: [auth, requireRole("admin", "editor", "user"), controller.create],
  },
];
