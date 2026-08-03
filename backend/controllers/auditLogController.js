const auditLogService = require("../services/auditLogService");

/**
 * Handles audit log HTTP requests.
 */
class AuditLogController {
  constructor() {
    this.getAll = this.getAll.bind(this);
  }

  /**
   * Sends a JSON response.
   *
   * @param {import("http").ServerResponse} res
   * @param {number} statusCode
   * @param {object} payload
   * @returns {void}
   */
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * Retrieves audit logs.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
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
