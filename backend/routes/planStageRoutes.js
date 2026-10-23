const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const validate = require("../middleware/validate");

const {
  idParamSchema,
  planTemplateIdParamSchema,
  reorderStagesSchema,
} = require("../validation/schemas");

const planStageController = require("../controllers/planStageController.js");

module.exports = [
  {
    method: "POST",
    path: "/api/plan_templates/:templateId/stages/reorder",
    handler: [
      auth,
      requireRole("admin", "editor"),
      validate("params", planTemplateIdParamSchema),
      validate("body", reorderStagesSchema),
      planStageController.reorder,
    ],
  },

  {
    method: "GET",
    path: "/api/plan_templates/:templateId/stages",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", planTemplateIdParamSchema),
      planStageController.getByTemplate,
    ],
  },

  {
    method: "GET",
    path: "/api/plan_stages/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", idParamSchema),
      planStageController.getById,
    ],
  },

  {
    method: "POST",
    path: "/api/plan_stages",
    handler: [auth, requireRole("admin", "editor"), planStageController.create],
  },

  {
    method: "PUT",
    path: "/api/plan_stages/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      validate("params", idParamSchema),
      planStageController.update,
    ],
  },

  {
    method: "DELETE",
    path: "/api/plan_stages/:id",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      planStageController.delete,
    ],
  },
];
