const planTemplateService = require("../services/planTemplateService");
const incidentTypeService = require("../services/incidentTypeService");
const AppError = require("../utils/AppError");

/**
 * Handles plan template HTTP requests.
 */
class PlanTemplateController {
  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.removeDraft = this.removeDraft.bind(this);
    this.approve = this.approve.bind(this);
    this.clone = this.clone.bind(this);
    this.retire = this.retire.bind(this);
    this.getCurrent = this.getCurrent.bind(this);
    this.getSummary = this.getSummary.bind(this);
    this.getHistory = this.getHistory.bind(this);
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
   * Validates and returns an ID value.
   *
   * @param {string} value
   * @returns {number}
   */
  _getId(value) {
    const id = Number(value);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    return id;
  }

  /**
   * Get all templates.
   */
  getAll(req, res) {
    const result = planTemplateService.getAllPlanTemplates(req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Get template by ID.
   */
  getById(req, res) {
    const id = this._getId(req.params.id);

    const template = planTemplateService.getPlanTemplateById(id);

    if (!template) {
      throw new AppError("Plan Template not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: template,
    });
  }

  /**
   * Create template.
   */
  create(req, res) {
    const { incident_type_id, incidentType, title } = req.body;

    let incidentTypeId = Number(incident_type_id);

    if (!incidentTypeId && incidentType?.name) {
      const createdIncidentType = incidentTypeService.createIncidentType({
        name: incidentType.name,
        description: incidentType.description || "",
      });

      incidentTypeId = createdIncidentType.id;
    }

    if (!incidentTypeId) {
      throw new AppError("Missing incident type ID", 400);
    }

    if (!title) {
      throw new AppError("Template title is required", 400);
    }

    const incidentTypeRecord =
      incidentTypeService.getIncidentTypeById(incidentTypeId);

    if (!incidentTypeRecord) {
      throw new AppError(
        `Incident type with ID ${incidentTypeId} not found`,
        404,
      );
    }

    const template = planTemplateService.createPlanTemplate(
      {
        incident_type_id: incidentTypeId,
        title,
      },
      req.user.id,
    );

    this._sendJSON(res, 201, {
      success: true,
      data: template,
    });
  }

  /**
   * Update template.
   */
  update(req, res) {
    const id = this._getId(req.params.id);

    const template = planTemplateService.updatePlanTemplate(
      id,
      req.body,
      req.user.id,
    );

    if (!template) {
      throw new AppError("Plan Template not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: template,
    });
  }

  /**
   * Remove draft template.
   */
  removeDraft(req, res) {
    const id = this._getId(req.params.id);

    const result = planTemplateService.removeDraftTemplate(id, req.user.id);

    this._sendJSON(res, 200, {
      success: true,
      message: "Draft template removed",
      data: result,
    });
  }

  /**
   * Approve template.
   */
  approve(req, res) {
    const id = this._getId(req.params.id);

    const template = planTemplateService.approveTemplate(id, req.user.id);

    this._sendJSON(res, 200, {
      success: true,
      data: template,
    });
  }

  /**
   * Clone template.
   */
  clone(req, res) {
    const id = this._getId(req.params.id);

    const template = planTemplateService.cloneTemplate(id, req.user.id);

    this._sendJSON(res, 201, {
      success: true,
      data: template,
    });
  }

  /**
   * Retire template.
   */
  retire(req, res) {
    const id = this._getId(req.params.id);

    const retired = planTemplateService.retireTemplate(id, req.user.id);

    if (!retired) {
      throw new AppError("Plan Template not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      message: "Plan Template retired",
    });
  }

  /**
   * Get current templates.
   */
  getCurrent(req, res) {
    const templates = planTemplateService.getCurrentPlanTemplates();

    this._sendJSON(res, 200, {
      success: true,
      data: templates,
    });
  }

  /**
   * Get template summary.
   */
  getSummary(req, res) {
    const templates = planTemplateService.getTemplateSummary();

    this._sendJSON(res, 200, {
      success: true,
      data: templates,
    });
  }

  /**
   * Get template history.
   */
  getHistory(req, res) {
    const id = this._getId(req.params.id);

    const history = planTemplateService.getTemplateHistory(id);

    this._sendJSON(res, 200, {
      success: true,
      data: history,
    });
  }
}

module.exports = new PlanTemplateController();
