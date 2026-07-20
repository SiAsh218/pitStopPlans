const planService = require("../services/planService");
const AppError = require("../utils/AppError");

class PlanController {
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getAll(req, res) {
    const plans = planService.getAllPlans();

    this._sendJSON(res, 200, {
      success: true,
      data: plans,
    });
  }

  getById(req, res) {
    const id = Number(req.params.id);

    const plan = planService.getPlan(id);

    if (!plan) {
      throw new AppError("Plan not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: plan,
    });
  }

  create(req, res) {
    console.log("POST /api/plans");
    console.log(req.body);

    const plan = planService.createPlan(req.body);

    this._sendJSON(res, 201, {
      success: true,

      data: plan,
    });
  }
}

module.exports = new PlanController();
