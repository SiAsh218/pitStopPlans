const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const controller = require("../controllers/incidentActionUpdateController");

module.exports = [
  /**
   * Get updates for action
   */
  {
    method: "GET",
    path: "/api/incident_actions/:id/updates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      controller.getByAction.bind(controller),
    ],
  },

  /**
   * Add comment/update
   */
  {
    method: "POST",
    path: "/api/incident_actions/:id/updates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      controller.create.bind(controller),
    ],
  },
];
