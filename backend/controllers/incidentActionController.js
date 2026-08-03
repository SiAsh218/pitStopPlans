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
    const result = incidentActionService.getByIncident(
      Number(req.params.incidentId),
      req.query,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
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
      data: incidentActionService.startAction(Number(req.params.id), req.user),
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
        req.user,
      ),
    });
  }

  /**
   * ============================================================
   * Reopen Action
   * ============================================================
   */
  reopen(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionService.reopenAction(Number(req.params.id), req.user),
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
