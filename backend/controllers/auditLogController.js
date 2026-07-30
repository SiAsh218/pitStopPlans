const auditLogService = require("../services/auditLogService");

class AuditLogController {
  _sendJSON(res, status, payload) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getAll(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: auditLogService.getRecent(),
    });
  }
}

module.exports = new AuditLogController();
