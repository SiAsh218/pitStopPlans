const auth = require("../middleware/auth");

const requireRole = require("../middleware/role");

const roleController = require("../controllers/roleController");

module.exports = [
  {
    method: "GET",
    path: "/api/roles",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      roleController.getAll.bind(roleController),
    ],
  },

  {
    method: "GET",
    path: "/api/roles/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      roleController.getById.bind(roleController),
    ],
  },

  {
    method: "POST",
    path: "/api/roles",
    handler: [
      auth,
      requireRole("admin"),
      roleController.create.bind(roleController),
    ],
  },

  {
    method: "DELETE",
    path: "/api/roles/:id",
    handler: [
      auth,
      requireRole("admin"),
      roleController.delete.bind(roleController),
    ],
  },
  {
    method: "PUT",
    path: "/api/roles/:id",
    handler: [
      auth,
      requireRole("admin"),
      roleController.update.bind(roleController),
    ],
  },
];
