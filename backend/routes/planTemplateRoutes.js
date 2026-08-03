const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const planTemplateController = require("../controllers/planTemplateController");

module.exports = [
  {
    method: "GET",
    path: "/api/plan_templates",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planTemplateController.getAll,
    ],
  },

  {
    method: "GET",
    path: "/api/plan_templates/current",
    handler: [auth, requireRole("admin"), planTemplateController.getCurrent],
  },

  {
    method: "GET",
    path: "/api/plan_templates/summary",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planTemplateController.getSummary,
    ],
  },

  {
    method: "GET",
    path: "/api/plan_templates/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planTemplateController.getById,
    ],
  },

  {
    method: "POST",
    path: "/api/plan_templates",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planTemplateController.create,
    ],
  },

  {
    method: "PUT",
    path: "/api/plan_templates/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planTemplateController.update,
    ],
  },

  {
    method: "DELETE",
    path: "/api/plan_templates/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planTemplateController.removeDraft,
    ],
  },

  {
    method: "POST",
    path: "/api/plan_templates/:id/approve",
    handler: [auth, requireRole("admin"), planTemplateController.approve],
  },

  {
    method: "POST",
    path: "/api/plan_templates/:id/clone",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planTemplateController.clone,
    ],
  },

  {
    method: "POST",
    path: "/api/plan_templates/:id/retire",
    handler: [auth, requireRole("admin"), planTemplateController.retire],
  },

  {
    method: "GET",
    path: "/api/plan_templates/:id/history",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planTemplateController.getHistory,
    ],
  },
];
