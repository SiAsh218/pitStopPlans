const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const validate = require("../middleware/validate");

const controller = require("../controllers/incidentActionController");

const {
  idParamSchema,
  incidentIdParamSchema,
  assignActionSchema,
} = require("../validation/schemas");

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
      validate("params", incidentIdParamSchema),
      controller.getByIncident,
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
      validate("params", idParamSchema),
      controller.getById,
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
      validate("params", idParamSchema),
      controller.start,
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
      validate("params", idParamSchema),
      controller.complete,
    ],
  },

  /**
   * Reopen
   */
  {
    method: "POST",
    path: "/api/incident_actions/:id/reopen",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", idParamSchema),
      controller.reopen,
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
      validate("params", idParamSchema),
      validate("body", assignActionSchema),
      controller.assign,
    ],
  },
];
