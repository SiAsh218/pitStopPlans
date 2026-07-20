const auth = require("../middleware/auth.js");
const requireRole = require("../middleware/role.js");

const planTemplateController = require("../controllers/planTemplateController.js");

module.exports = [
  /**
   * ============================================================
   * Get All Templates
   * ============================================================
   */
  {
    method: "GET",
    path: "/api/plan_templates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planTemplateController.getAll.bind(planTemplateController),
    ],
  },

  /**
   * ============================================================
   * Get Template By ID
   * ============================================================
   */
  {
    method: "GET",
    path: "/api/plan_templates/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planTemplateController.getById.bind(planTemplateController),
    ],
  },

  /**
   * ============================================================
   * Create Template
   * ============================================================
   */
  {
    method: "POST",
    path: "/api/plan_templates",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planTemplateController.create.bind(planTemplateController),
    ],
  },

  /**
   * ============================================================
   * Update Draft Template
   * ============================================================
   */
  {
    method: "PUT",
    path: "/api/plan_templates/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planTemplateController.update.bind(planTemplateController),
    ],
  },

  /**
   * ============================================================
   * Approve Template
   * ============================================================
   */
  {
    method: "POST",
    path: "/api/plan_templates/:id/approve",
    handler: [
      auth,
      requireRole("admin"),
      planTemplateController.approve.bind(planTemplateController),
    ],
  },

  /**
   * ============================================================
   * Clone Template
   * ============================================================
   */
  {
    method: "POST",
    path: "/api/plan_templates/:id/clone",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planTemplateController.clone.bind(planTemplateController),
    ],
  },

  /**
   * ============================================================
   * Retire Template
   * ============================================================
   */
  {
    method: "POST",
    path: "/api/plan_templates/:id/retire",
    handler: [
      auth,
      requireRole("admin"),
      planTemplateController.retire.bind(planTemplateController),
    ],
  },
];
