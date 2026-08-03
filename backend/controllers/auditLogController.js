const auditLogService = require("../services/auditLogService");

class AuditLogController {
  _sendJSON(res, status, payload) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getAll(req, res) {
    const result = auditLogService.getRecent(req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }
}

module.exports = new AuditLogController();
