const planStageService = require("../services/planStageService");
const AppError = require("../utils/AppError");

/**
 * Handles plan stage HTTP requests.
 */
class PlanStageController {
  constructor() {
    this.getByTemplate = this.getByTemplate.bind(this);
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
   * Gets stages for a template.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getByTemplate(req, res) {
    const templateId = Number(req.params.templateId);

    const result = planStageService.getStagesByTemplate(templateId, req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Gets a stage by ID.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getById(req, res) {
    const id = Number(req.params.id);

    const stage = planStageService.getStageById(id);

    if (!stage) {
      throw new AppError("Stage not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: stage,
    });
  }

  /**
   * Creates a stage.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  create(req, res) {
    const stage = planStageService.createStage(req.body);

    this._sendJSON(res, 201, {
      success: true,
      data: stage,
    });
  }

  /**
   * Updates a stage.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  update(req, res) {
    const id = Number(req.params.id);

    const updated = planStageService.updateStage(id, req.body);

    if (!updated) {
      throw new AppError("Stage not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: updated,
    });
  }

  /**
   * Deletes a stage.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  delete(req, res) {
    const id = Number(req.params.id);

    const deleted = planStageService.deleteStage(id);

    if (!deleted) {
      throw new AppError("Stage not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      message: "Stage deleted",
    });
  }
}

module.exports = new PlanStageController();
