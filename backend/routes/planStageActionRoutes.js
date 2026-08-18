const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const validate = require("../middleware/validate");

const {
  planStageIdParamSchema,
  idParamSchema,
} = require("../validation/schemas");

const planStageActionController = require("../controllers/planStageActionController");

module.exports = [
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
      planStageActionController.create,
    ],
  },

  {
    method: "PUT",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      validate("params", idParamSchema),
      planStageActionController.update,
    ],
  },

  {
    method: "DELETE",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin"),
      validate("params", idParamSchema),
      planStageActionController.delete,
    ],
  },
];
