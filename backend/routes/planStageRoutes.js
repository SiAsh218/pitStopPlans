const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const planStageController = require("../controllers/planStageController.js");

module.exports = [
  {
    method: "GET",
    path: "/api/plan_templates/:templateId/stages",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planStageController.getByTemplate.bind(planStageController),
    ],
  },

  {
    method: "GET",
    path: "/api/plan_stages/:id",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      planStageController.getById.bind(planStageController),
    ],
  },

  {
    method: "POST",
    path: "/api/plan_stages",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planStageController.create.bind(planStageController),
    ],
  },

  {
    method: "PUT",
    path: "/api/plan_stages/:id",
    handler: [
      auth,
      requireRole("admin", "editor"),
      planStageController.update.bind(planStageController),
    ],
  },

  {
    method: "DELETE",
    path: "/api/plan_stages/:id",
    handler: [
      auth,
      requireRole("admin"),
      planStageController.delete.bind(planStageController),
    ],
  },
];
