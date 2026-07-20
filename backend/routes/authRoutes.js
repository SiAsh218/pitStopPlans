const auth = require("../middleware/auth.js");
const requireRole = require("../middleware/role.js");
const authController = require("../controllers/authController.js");

module.exports = [
  /**
   * Register new user
   */
  {
    method: "POST",
    path: "/api/auth/register",
    handler: [
      auth,
      requireRole("admin"),
      authController.register.bind(authController),
    ],
  },

  /**
   * Login user and return JWT
   */
  {
    method: "POST",
    path: "/api/auth/login",
    handler: authController.login.bind(authController),
  },
  {
    method: "GET",
    path: "/api/auth/validate",
    handler: [auth, authController.validate.bind(authController)],
  },
];
