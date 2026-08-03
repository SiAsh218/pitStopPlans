const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const userController = require("../controllers/userController");

module.exports = [
  {
    method: "GET",
    path: "/api/users",
    handler: [auth, requireRole("admin"), userController.getAll],
  },

  {
    method: "GET",
    path: "/api/users/:id",
    handler: [auth, requireRole("admin"), userController.getById],
  },

  {
    method: "POST",
    path: "/api/users",
    handler: [auth, requireRole("admin"), userController.create],
  },

  {
    method: "PUT",
    path: "/api/users/:id",
    handler: [auth, requireRole("admin"), userController.update],
  },

  {
    method: "PUT",
    path: "/api/users/:id/disable",
    handler: [auth, requireRole("admin"), userController.disable],
  },

  {
    method: "PUT",
    path: "/api/users/:id/enable",
    handler: [auth, requireRole("admin"), userController.enable],
  },

  {
    method: "PUT",
    path: "/api/users/:id/roles",
    handler: [auth, requireRole("admin"), userController.updateRoles],
  },
];
