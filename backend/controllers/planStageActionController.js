const AppError = require("../utils/AppError");

const planStageActionService = require("../services/planStageActionService");

class PlanStageActionController {
  _sendJSON(res, status, payload) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getByStage(req, res) {
    const stageId = Number(req.params.stageId);

    this._sendJSON(res, 200, {
      success: true,
      data: planStageActionService.getActionsByStage(stageId),
    });
  }

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

  create(req, res) {
    const action = planStageActionService.createAction(req.body);

    this._sendJSON(res, 201, {
      success: true,
      data: action,
    });
  }

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
