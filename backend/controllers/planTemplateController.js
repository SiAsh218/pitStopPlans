const planTemplateService = require("../services/planTemplateService.js");

const incidentTypeService = require("../services/incidentTypeService.js");

const AppError = require("../utils/AppError");

class PlanTemplateController {
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * ============================================================
   * Get All Templates
   * ============================================================
   */
  getAll(req, res) {
    const templates = planTemplateService.getAllPlanTemplates();

    this._sendJSON(res, 200, {
      success: true,
      data: templates,
    });
  }

  /**
   * ============================================================
   * Get Template By ID
   * ============================================================
   */
  getById(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

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
   * ============================================================
   * Create Template
   * ============================================================
   */
  create(req, res) {
    const { incident_type_id, title } = req.body;

    if (!incident_type_id) {
      throw new AppError("Missing incident type ID", 400);
    }

    if (!title) {
      throw new AppError("Template title is required", 400);
    }

    const incidentType =
      incidentTypeService.getIncidentTypeById(incident_type_id);

    if (!incidentType) {
      throw new AppError(
        `Incident type with ID ${incident_type_id} not found`,
        404,
      );
    }

    const template = planTemplateService.createPlanTemplate(
      {
        incident_type_id,
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
   * ============================================================
   * Update Draft Template
   * ============================================================
   */
  update(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const template = planTemplateService.updatePlanTemplate(id, req.body);

    if (!template) {
      throw new AppError("Plan Template not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: template,
    });
  }

  /**
   * ============================================================
   * Approve Template
   * ============================================================
   */
  approve(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const template = planTemplateService.approveTemplate(id, req.user.id);

    this._sendJSON(res, 200, {
      success: true,
      data: template,
    });
  }

  /**
   * ============================================================
   * Clone Template
   * ============================================================
   */
  clone(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const template = planTemplateService.cloneTemplate(id, req.user.id);

    this._sendJSON(res, 201, {
      success: true,
      data: template,
    });
  }

  /**
   * ============================================================
   * Retire Template
   * ============================================================
   */
  retire(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const retired = planTemplateService.retireTemplate(id);

    if (!retired) {
      throw new AppError("Plan Template not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      message: "Plan Template retired",
    });
  }

  getCurrent(req, res) {
    const templates = planTemplateService.getCurrentPlanTemplates();

    this._sendJSON(res, 200, {
      success: true,
      data: templates,
    });
  }
}

module.exports = new PlanTemplateController();
