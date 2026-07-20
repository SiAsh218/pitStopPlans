const AppError = require("../utils/AppError");

const incidentActionUpdateService = require("../services/incidentActionUpdateService");

class IncidentActionUpdateController {
  _sendJSON(res, status, payload) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * ============================================================
   * Get Updates For Action
   * ============================================================
   */
  getByAction(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionUpdateService.getUpdates(Number(req.params.id)),
    });
  }

  /**
   * ============================================================
   * Add Comment
   * ============================================================
   */
  create(req, res) {
    const note = req.body.note;

    if (!note?.trim()) {
      throw new AppError("Update note is required", 400);
    }

    this._sendJSON(res, 201, {
      success: true,
      data: incidentActionUpdateService.addComment(
        Number(req.params.id),
        req.user.id,
        note,
      ),
    });
  }
}

module.exports = new IncidentActionUpdateController();
