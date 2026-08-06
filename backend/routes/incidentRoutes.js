const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const incidentController = require("../controllers/incidentController");

const authenticatedUser = [auth, requireRole("admin", "editor", "user")];
const editorAccess = [auth, requireRole("admin", "editor")];

module.exports = [
  {
    method: "GET",
    path: "/api/incidents",
    handler: [...authenticatedUser, incidentController.getAll],
  },

  {
    method: "GET",
    path: "/api/incidents/:id",
    handler: [...authenticatedUser, incidentController.getById],
  },

  {
    method: "POST",
    path: "/api/incidents",
    handler: [...authenticatedUser, incidentController.create],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/close",
    handler: [...editorAccess, incidentController.close],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/reopen",
    handler: [...editorAccess, incidentController.reopen],
  },

  {
    method: "GET",
    path: "/api/incidents/:id/dashboard",
    handler: [...authenticatedUser, incidentController.dashboard],
  },
];
