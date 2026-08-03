const AppError = require("../utils/AppError");
const incidentActionService = require("../services/incidentActionService");

/**
 * Handles incident action HTTP requests.
 */
class IncidentActionController {
  constructor() {
    this.getByIncident = this.getByIncident.bind(this);
    this.getById = this.getById.bind(this);
    this.start = this.start.bind(this);
    this.complete = this.complete.bind(this);
    this.reopen = this.reopen.bind(this);
    this.assign = this.assign.bind(this);
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
   * Gets actions for an incident.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
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
   * Gets a single incident action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
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
   * Starts an action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  start(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionService.startAction(Number(req.params.id), req.user),
    });
  }

  /**
   * Completes an action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
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
   * Reopens an action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  reopen(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: incidentActionService.reopenAction(Number(req.params.id), req.user),
    });
  }

  /**
   * Assigns an action to a user.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
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
