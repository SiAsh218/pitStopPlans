const planTemplateRepository = require("../data/repositories/planTemplateRepository.js");

const incidentTypeRepository = require("../data/repositories/incidentTypeRepository.js");

const planStageRepository = require("../data/repositories/planStageRepository");

const planStageActionRepository = require("../data/repositories/planStageActionRepository");

const AppError = require("../utils/AppError");

class PlanTemplateService {
  /**
   * ============================================================
   * Map Database Row -> DTO
   * ============================================================
   */
  _toDTO(row) {
    return {
      id: row.id,

      title: row.title,

      version: row.version,

      status: row.status,

      created_at: row.created_at,

      approved_at: row.approved_at,

      incident_type: {
        id: row.incident_type_id,
        name: row.incident_type_name,
      },
    };
  }

  /**
   * ============================================================
   * Get All Templates
   * ============================================================
   */
  getAllPlanTemplates() {
    const rows = planTemplateRepository.findAllWithIncidentType();

    return rows.map((row) => this._toDTO(row));
  }

  /**
   * ============================================================
   * Get Template By ID
   * ============================================================
   */
  getPlanTemplateById(id) {
    const row = planTemplateRepository.findByIdWithIncidentType(id);

    if (!row) {
      return null;
    }

    return this._toDTO(row);
  }

  /**
   * ============================================================
   * Create Template
   * ============================================================
   */
  createPlanTemplate(data, userId) {
    const incidentTypeId = Number(data.incident_type_id);

    if (!Number.isInteger(incidentTypeId) || incidentTypeId <= 0) {
      throw new AppError("Invalid incident type id", 400);
    }

    const incidentType = incidentTypeRepository.findById(incidentTypeId);

    if (!incidentType) {
      throw new AppError("Incident type not found", 404);
    }

    const latestVersion =
      planTemplateRepository.findLatestVersionByIncidentType(incidentTypeId);

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

    const result = planTemplateRepository.insert({
      incident_type_id: incidentTypeId,

      version: nextVersion,

      title: data.title,

      status: "draft",

      created_by: userId,
    });

    return this.getPlanTemplateById(result.lastInsertRowid);
  }

  /**
   * ============================================================
   * Update Draft Template
   * ============================================================
   */
  updatePlanTemplate(id, updates) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      return null;
    }

    if (template.status === "approved") {
      throw new AppError(
        "Approved templates cannot be edited. Create a new version instead.",
        400,
      );
    }

    const fields = {};

    if (updates.title !== undefined) {
      fields.title = updates.title;
    }

    if (updates.status !== undefined) {
      fields.status = updates.status;
    }

    if (Object.keys(fields).length > 0) {
      planTemplateRepository.updateById(id, fields);
    }

    return this.getPlanTemplateById(id);
  }

  /**
   * ============================================================
   * Approve Template
   * ============================================================
   */
  approveTemplate(id, userId) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    if (template.status === "approved") {
      throw new AppError("Template already approved", 400);
    }

    planTemplateRepository.updateById(id, {
      status: "approved",

      approved_by: userId,

      approved_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    });

    return this.getPlanTemplateById(id);
  }

  /**
   * ============================================================
   * Clone Template
   * ============================================================
   *
   * Creates:
   * - New template version
   * - Copies stages
   * - Copies actions
   * - Copies role assignments
   */
  cloneTemplate(id, userId) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    const latestVersion =
      planTemplateRepository.findLatestVersionByIncidentType(
        template.incident_type_id,
      );

    /**
     * Create new template
     */
    const templateResult = planTemplateRepository.insert({
      incident_type_id: template.incident_type_id,

      version: latestVersion.version + 1,

      title: template.title,

      status: "draft",

      created_by: userId,
    });

    const newTemplateId = templateResult.lastInsertRowid;

    /**
     * Clone stages
     */
    const stages = planStageRepository.findByTemplateId(template.id);

    for (const stage of stages) {
      const newStage = planStageRepository.cloneStage(stage.id, newTemplateId);

      /**
       * Clone actions
       */
      const actions = planStageActionRepository.findByStageId(stage.id);

      for (const action of actions) {
        planStageActionRepository.cloneAction(action.id, newStage.id);
      }
    }

    return this.getPlanTemplateById(newTemplateId);
  }

  /**
   * ============================================================
   * Retire Template
   * ============================================================
   */
  retireTemplate(id) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      return false;
    }

    planTemplateRepository.updateById(id, {
      status: "retired",
    });

    return true;
  }
}

module.exports = new PlanTemplateService();
