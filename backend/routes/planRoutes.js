const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const planController = require("../controllers/planController");

const validate = require("../middleware/validate");

const { idParamSchema } = require("../validation/schemas");

module.exports = [
  /**
   * Get all plans.
   */
  {
    method: "GET",
    path: "/api/plans",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planController.getAll,
    ],
  },

  /**
   * Get plan by ID.
   */
  {
    method: "GET",
    path: "/api/plans/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", idParamSchema),
      planController.getById,
    ],
  },

  /**
   * Create a plan.
   */
  {
    method: "POST",
    path: "/api/plans",
    handler: [auth, requireRole("admin", "editor"), planController.create],
  },
];
