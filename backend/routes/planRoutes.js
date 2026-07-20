const auth = require("../middleware/auth.js");
const requireRole = require("../middleware/role.js");
const planController = require("../controllers/planController.js");

module.exports = [
  /**
   * Get all plans
   */
  {
    method: "GET",
    path: "/api/plans",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planController.getAll.bind(planController),
    ],
  },

  /**
   * Get full plan by template ID
   */
  {
    method: "GET",
    path: "/api/plans/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planController.getById.bind(planController),
    ],
  },
  /**
   * Create full plan by template ID
   */
  {
    method: "POST",
    path: "/api/plans",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planController.create.bind(planController),
    ],
  },
];
