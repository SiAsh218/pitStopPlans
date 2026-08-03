const AppError = require("../utils/AppError");
const planStageActionService = require("../services/planStageActionService");

/**
 * Handles plan stage action HTTP requests.
 */
class PlanStageActionController {
  constructor() {
    this.getByStage = this.getByStage.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
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
   * Gets actions for a stage.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getByStage(req, res) {
    const stageId = Number(req.params.stageId);

    const result = planStageActionService.getActionsByStage(stageId, req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Gets an action by ID.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getById(req, res) {
    const action = planStageActionService.getActionById(Number(req.params.id));

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: action,
    });
  }

  /**
   * Creates a stage action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  create(req, res) {
    const action = planStageActionService.createAction(req.body);

    this._sendJSON(res, 201, {
      success: true,
      data: action,
    });
  }

  /**
   * Updates a stage action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  update(req, res) {
    const action = planStageActionService.updateAction(
      Number(req.params.id),
      req.body,
    );

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: action,
    });
  }

  /**
   * Deletes a stage action.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  delete(req, res) {
    const deleted = planStageActionService.deleteAction(Number(req.params.id));

    if (!deleted) {
      throw new AppError("Action not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      message: "Action deleted",
    });
  }
}

module.exports = new PlanStageActionController();
