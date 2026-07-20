const planStageService = require("../services/planStageService.js");

const AppError = require("../utils/AppError.js");

class PlanStageController {
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getByTemplate(req, res) {
    const templateId = Number(req.params.templateId);

    const stages = planStageService.getStagesByTemplate(templateId);

    this._sendJSON(res, 200, {
      success: true,
      data: stages,
    });
  }

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

  create(req, res) {
    const stage = planStageService.createStage(req.body);

    this._sendJSON(res, 201, {
      success: true,
      data: stage,
    });
  }

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
