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
];
