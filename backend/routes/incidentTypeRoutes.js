const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const incidentTypeController = require("../controllers/incidentTypeController");

module.exports = [
  {
    method: "GET",
    path: "/api/incident-types",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      incidentTypeController.getAll,
    ],
  },

  {
    method: "GET",
    path: "/api/incident_types/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      incidentTypeController.getById,
    ],
  },

  {
    method: "POST",
    path: "/api/incident_types",
    handler: [
      auth,
      requireRole("admin", "editor"),
      incidentTypeController.create,
    ],
  },

  {
    method: "PUT",
    path: "/api/incident_types/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      incidentTypeController.update,
    ],
  },

  {
    method: "DELETE",
    path: "/api/incident_types/:id",
    handler: [auth, requireRole("admin"), incidentTypeController.delete],
  },
];
