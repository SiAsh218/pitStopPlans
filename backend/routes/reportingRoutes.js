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
    path: "/api/reporting/incidents/:id",
    handler: [requireApiKey, reportingController.getById],
  },
];
