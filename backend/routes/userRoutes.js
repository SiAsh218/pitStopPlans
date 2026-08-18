const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const validate = require("../middleware/validate");

const userController = require("../controllers/userController");

const {
  idParamSchema,
  createUserSchema,
  updateUserSchema,
  updateUserRolesSchema,
} = require("../validation/schemas");

module.exports = [
  {
    method: "GET",
    path: "/api/users",
    handler: [auth, requireRole("admin"), userController.getAll],
  },

  {
    method: "GET",
    path: "/api/users/:id",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      userController.getById,
    ],
  },

  {
    method: "POST",
    path: "/api/users",
    handler: [
      auth,
      requireRole("admin"),
      validate("body", createUserSchema),
      userController.create,
    ],
  },

  {
    method: "PUT",
    path: "/api/users/:id",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      validate("body", updateUserSchema),
      userController.update,
    ],
  },

  {
    method: "PUT",
    path: "/api/users/:id/disable",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      userController.disable,
    ],
  },

  {
    method: "PUT",
    path: "/api/users/:id/enable",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      userController.enable,
    ],
  },

  {
    method: "PUT",
    path: "/api/users/:id/roles",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      validate("body", updateUserRolesSchema),
      userController.updateRoles,
    ],
  },
];
