const viewController = require("../controllers/viewController.js");

module.exports = [
  {
    method: "GET",
    path: "/",
    handler: viewController.home.bind(viewController),
  },
  {
    method: "GET",
    path: "/login",
    handler: viewController.login.bind(viewController),
  },
  {
    method: "GET",
    path: "/templates",
    handler: viewController.createPlanTemplate.bind(viewController),
  },
  {
    method: "GET",
    path: "/create-incident",
    handler: viewController.createIncident.bind(viewController),
  },
  {
    method: "GET",
    path: "/incidents/:id",
    handler: viewController.incident.bind(viewController),
  },
  {
    method: "GET",
    path: "/templates/:id",
    handler: viewController.planTemplate.bind(viewController),
  },
];
