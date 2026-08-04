const viewController = require("../controllers/viewController");

module.exports = [
  {
    method: "GET",
    path: "/",
    handler: viewController.dashboard,
  },
  {
    method: "GET",
    path: "/login",
    handler: viewController.login,
  },
  {
    method: "GET",
    path: "/templates",
    handler: viewController.createPlanTemplate,
  },
  {
    method: "GET",
    path: "/create-incident",
    handler: viewController.createIncident,
  },
  {
    method: "GET",
    path: "/incidents/:id",
    handler: viewController.incident,
  },
  {
    method: "GET",
    path: "/templates/:id",
    handler: viewController.planTemplate,
  },
  {
    method: "GET",
    path: "/users",
    handler: viewController.users,
  },
  {
    method: "GET",
    path: "/roles",
    handler: viewController.roles,
  },
  {
    method: "GET",
    path: "/audit-log",
    handler: viewController.auditLog,
  },
];
