const requireApiKey = require("../middleware/requireApiKey");
const reportingController = require("../controllers/reportingController");

module.exports = [
  {
    method: "GET",
    path: "/api/reporting/incidents",
    handler: [requireApiKey, reportingController.getIncidents],
  },
  {
    method: "GET",
    path: "/api/reporting/actions",
    handler: [requireApiKey, reportingController.getActions],
  },
  {
    method: "GET",
    path: "/api/reporting/action-roles",
    handler: [requireApiKey, reportingController.getActionRoles],
  },
  {
    method: "GET",
    path: "/api/reporting/action-updates",
    handler: [requireApiKey, reportingController.getActionUpdates],
  },
  {
    method: "GET",
    path: "/api/reporting/incident-types",
    handler: [requireApiKey, reportingController.getIncidentTypes],
  },
  {
    method: "GET",
    path: "/api/reporting/plan-templates",
    handler: [requireApiKey, reportingController.getPlanTemplates],
  },
  {
    method: "GET",
    path: "/api/reporting/plan-stages",
    handler: [requireApiKey, reportingController.getPlanStages],
  },
  {
    method: "GET",
    path: "/api/reporting/plan-stage-actions",
    handler: [requireApiKey, reportingController.getPlanStageActions],
  },
  {
    method: "GET",
    path: "/api/reporting/plan-stage-action-roles",
    handler: [requireApiKey, reportingController.getPlanStageActionRoles],
  },
  {
    method: "GET",
    path: "/api/reporting/roles",
    handler: [requireApiKey, reportingController.getRoles],
  },
  {
    method: "GET",
    path: "/api/reporting/user-roles",
    handler: [requireApiKey, reportingController.getUserRoles],
  },
  {
    method: "GET",
    path: "/api/reporting/users",
    handler: [requireApiKey, reportingController.getUsers],
  },
  {
    method: "GET",
    path: "/api/reporting/audit-logs",
    handler: [requireApiKey, reportingController.getAuditLogs],
  },
];
