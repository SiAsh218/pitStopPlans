const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const validate = require("../middleware/validate");

const { idParamSchema } = require("../validation/schemas");

const roleController = require("../controllers/roleController");

module.exports = [
  {
    method: "GET",
    path: "/api/roles",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      roleController.getAll,
    ],
  },

  {
    method: "GET",
    path: "/api/roles/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", idParamSchema),
      roleController.getById,
    ],
  },

  {
    method: "POST",
    path: "/api/roles",
    handler: [auth, requireRole("admin"), roleController.create],
  },

  {
    method: "DELETE",
    path: "/api/roles/:id",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      roleController.delete,
    ],
  },

  {
    method: "PUT",
    path: "/api/roles/:id",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      roleController.update,
    ],
  },
];
