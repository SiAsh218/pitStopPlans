const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const validate = require("../middleware/validate");

const controller = require("../controllers/incidentActionUpdateController");

const {
  idParamSchema,
  incidentIdParamSchema,
  createIncidentActionUpdateSchema,
} = require("../validation/schemas");

module.exports = [
  {
    method: "GET",
    path: "/api/incidents/:incidentId/action-updates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", incidentIdParamSchema),
      controller.getByIncident,
    ],
  },

  /**
   * Get updates for an action.
   */
  {
    method: "GET",
    path: "/api/incident_actions/:id/updates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", idParamSchema),
      controller.getByAction,
    ],
  },

  /**
   * Add comment/update.
   */
  {
    method: "POST",
    path: "/api/incident_actions/:id/updates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", idParamSchema),
      validate("body", createIncidentActionUpdateSchema),
      controller.create,
    ],
  },
];
