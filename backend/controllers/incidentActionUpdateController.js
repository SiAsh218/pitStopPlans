// const AppError = require("../utils/AppError");
const incidentActionUpdateService = require("../services/incidentActionUpdateService");

/**
 * Handles incident action update HTTP requests.
 */
class IncidentActionUpdateController {
  constructor() {
    this.getByAction = this.getByAction.bind(this);
    this.create = this.create.bind(this);
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
   * Retrieves updates for an incident action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getByAction(req, res) {
    const result = incidentActionUpdateService.getUpdates(
      Number(req.params.id),
      req.query,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Creates a new comment/update.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   * @throws {AppError} When note is missing.
   */
  create(req, res) {
    const note = req.body.note;

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
