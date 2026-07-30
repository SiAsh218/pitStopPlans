const auth = require("../middleware/auth.js");
const requireRole = require("../middleware/role.js");
const auditLogController = require("../controllers/auditLogController.js");

module.exports = [
  {
    method: "GET",
    path: "/api/audit-logs",
    handler: [
      auth,
      requireRole("admin"),
      auditLogController.getAll.bind(auditLogController),
    ],
  },
];
