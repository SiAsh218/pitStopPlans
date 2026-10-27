const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const validate = require("../middleware/validate");

const {
  planStageIdParamSchema,
  idParamSchema,
  reorderActionsSchema,
} = require("../validation/schemas");

const planStageActionController = require("../controllers/planStageActionController");
const requireTemplateRevision = require("../middleware/templateRevision");

module.exports = [
  {
    method: "POST",
    path: "/api/plan_stages/:stageId/actions/reorder",
    handler: [
      auth,
      requireRole("admin", "editor"),
      validate("params", planStageIdParamSchema),
      validate("body", reorderActionsSchema),
      requireTemplateRevision(planStageActionController.reorder),
    ],
  },

  {
    method: "GET",
    path: "/api/plan_stages/:stageId/actions",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", planStageIdParamSchema),
      planStageActionController.getByStage,
    ],
  },

  {
    method: "GET",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      validate("params", idParamSchema),
      planStageActionController.getById,
    ],
  },

  {
    method: "POST",
    path: "/api/plan_stage_actions",
    handler: [
      auth,
      requireRole("admin", "editor"),
      requireTemplateRevision(planStageActionController.create),
    ],
  },

  {
    method: "PUT",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      validate("params", idParamSchema),
      requireTemplateRevision(planStageActionController.update),
    ],
  },

  {
    method: "DELETE",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      requireTemplateRevision(planStageActionController.delete),
    ],
  },
];
