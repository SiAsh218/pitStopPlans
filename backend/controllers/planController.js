const planService = require("../services/planService");
const AppError = require("../utils/AppError");

/**
 * Handles plan-related HTTP requests.
 */
class PlanController {
  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
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
   * Retrieves all plans.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getAll(req, res) {
    const result = planService.getAllPlans(req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Retrieves a plan by ID.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
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

  /**
   * Creates a plan.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  create(req, res) {
    const plan = planService.createPlan(req.body);

    this._sendJSON(res, 201, {
      success: true,
      data: plan,
    });
  }
}

module.exports = new PlanController();
