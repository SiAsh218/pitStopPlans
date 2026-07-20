const AppError = require("../utils/AppError");

const incidentActionService = require("../services/incidentActionService");

class IncidentActionController {
  _sendJSON(res, status, payload) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * ============================================================
   * Get Actions For Incident
   * ============================================================
   */
  getByIncident(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionService.getByIncident(Number(req.params.incidentId)),
    });
  }

  /**
   * ============================================================
   * Get Action By ID
   * ============================================================
   */
  getById(req, res) {
    const action = incidentActionService.getById(Number(req.params.id));

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: action,
    });
  }

  /**
   * ============================================================
   * Start Action
   * ============================================================
   */
  start(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionService.startAction(
        Number(req.params.id),
        req.user.id,
      ),
    });
  }

  /**
   * ============================================================
   * Complete Action
   * ============================================================
   */
  complete(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionService.completeAction(
        Number(req.params.id),
        req.user.id,
      ),
    });
  }

  /**
   * ============================================================
   * Assign Action
   * ============================================================
   */
  assign(req, res) {
    const userId = Number(req.body.user_id);

    if (!userId) {
      throw new AppError("user_id is required", 400);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionService.assignAction(Number(req.params.id), userId),
    });
  }
}

module.exports = new IncidentActionController();
