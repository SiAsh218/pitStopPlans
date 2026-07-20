const auth = require("../middleware/auth.js");
const requireRole = require("../middleware/role.js");
const incidentTypeController = require("../controllers/incidentTypeController.js");

module.exports = [
  /**
   * Get all incident types
   */
  {
    method: "GET",
    path: "/api/incident-types",
    handler: [
      auth, // Authenticates JWT
      requireRole("admin", "editor", "user"),
      incidentTypeController.getAll.bind(incidentTypeController),
    ],
  },

  /**
   * Get incident type by id
   */
  {
    method: "GET",
    path: "/api/incident_types/:id",
    handler: [
      auth, // Authenticates JWT
      requireRole("admin", "editor", "user"),
      incidentTypeController.getById.bind(incidentTypeController),
    ],
  },

  /**
   * Create new incident types
   */
  {
    method: "POST",
    path: "/api/incident_types",
    handler: [
      auth, // Authenticates JWT
      requireRole("admin", "editor"),
      incidentTypeController.create.bind(incidentTypeController),
    ],
  },

  /**
   * Update incident type
   */
  {
    method: "PUT",
    path: "/api/incident_types/:id",
    handler: [
      auth, // Authenticates JWT
      requireRole("admin", "editor"),
      incidentTypeController.update.bind(incidentTypeController),
    ],
  },

  /**
   * Delete incident type
   */
  {
    method: "DELETE",
    path: "/api/incident_types/:id",
    handler: [
      auth, // Authenticates JWT
      requireRole("admin"),
      incidentTypeController.delete.bind(incidentTypeController),
    ],
  },
];
