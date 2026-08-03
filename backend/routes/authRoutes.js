const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const authController = require("../controllers/authController");

module.exports = [
  /**
   * Register a new user.
   */
  {
    method: "POST",
    path: "/api/auth/register",
    handler: [auth, requireRole("admin"), authController.register],
  },

  /**
   * Login and receive a JWT.
   */
  {
    method: "POST",
    path: "/api/auth/login",
    handler: authController.login,
  },

  /**
   * Validate current JWT.
   */
  {
    method: "GET",
    path: "/api/auth/validate",
    handler: [auth, authController.validate],
  },
];
