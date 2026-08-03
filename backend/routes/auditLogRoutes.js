const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const auditLogController = require("../controllers/auditLogController");

module.exports = [
  {
    method: "GET",
    path: "/api/audit-logs",
    handler: [auth, requireRole("admin"), auditLogController.getAll],
  },
];
