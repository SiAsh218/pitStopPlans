const auth = require("../middleware/auth");

const requireRole = require("../middleware/role");

const planStageActionController = require("../controllers/planStageActionController");

module.exports = [
  {
    method: "GET",
    path: "/api/plan_stages/:stageId/actions",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planStageActionController.getByStage.bind(planStageActionController),
    ],
  },

  {
    method: "GET",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planStageActionController.getById.bind(planStageActionController),
    ],
  },

  {
    method: "POST",
    path: "/api/plan_stage_actions",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planStageActionController.create.bind(planStageActionController),
    ],
  },

  {
    method: "PUT",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planStageActionController.update.bind(planStageActionController),
    ],
  },

  {
    method: "DELETE",
    path: "/api/plan_stage_actions/:id",
    handler: [
      auth,
      requireRole("admin"),
      planStageActionController.delete.bind(planStageActionController),
    ],
  },
];
