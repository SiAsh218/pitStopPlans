const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const validate = require("../middleware/validate");
const { csrf } = require("../middleware/csrf");
const authController = require("../controllers/authController");

const { loginSchema, registerSchema } = require("../validation/schemas");

module.exports = [
  {
    method: "POST",
    path: "/api/auth/register",
    handler: [
      auth,
      requireRole("admin"),
      validate("body", registerSchema),
      authController.register,
    ],
  },

  {
    method: "POST",
    path: "/api/auth/login",
    handler: [validate("body", loginSchema), authController.login],
  },

  {
    method: "GET",
    path: "/api/auth/validate",
    handler: [auth, authController.validate],
  },

  {
    method: "POST",
    path: "/api/auth/refresh",
    handler: [csrf, authController.refresh],
  },

  {
    method: "POST",
    path: "/api/auth/logout",
    handler: [csrf, authController.logout],
  },
];
