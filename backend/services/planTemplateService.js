const planTemplateRepository = require("../data/repositories/planTemplateRepository.js");

const incidentTypeRepository = require("../data/repositories/incidentTypeRepository.js");

const planStageRepository = require("../data/repositories/planStageRepository");

const planStageActionRepository = require("../data/repositories/planStageActionRepository");

const auditService = require("../services/auditLogService.js");

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
  getAllPlanTemplates(options = {}) {
    const result = planTemplateRepository.findAllWithQuery(options);

    return {
      rows: result.rows.map((row) => this._toDTO(row)),
      meta: result.meta,
    };
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

    const createdTemplate = this.getPlanTemplateById(result.lastInsertRowid);

    auditService.log(
      userId,
      "CREATE_TEMPLATE",
      "plan_template",
      createdTemplate.id,
      {
        title: createdTemplate.title,
        version: createdTemplate.version,
        status: createdTemplate.status,
        incidentTypeId: createdTemplate.incident_type.id,
        incidentTypeName: createdTemplate.incident_type.name,
      },
    );

    return createdTemplate;
  }

  /**
   * ============================================================
   * Update Draft Template
   * ============================================================
   */
  updatePlanTemplate(id, updates, userId) {
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

    const beforeTemplate = this.getPlanTemplateById(id);

    const fields = {};

    if (updates.title !== undefined) {
      fields.title = updates.title;
    }

    if (updates.status !== undefined) {
      fields.status = updates.status;
    }

    if (Object.keys(fields).length > 0) {
      planTemplateRepository.updateById(id, fields);

      const afterTemplate = this.getPlanTemplateById(id);

      auditService.log(userId, "UPDATE_TEMPLATE", "plan_template", id, {
        before: {
          title: beforeTemplate.title,
          status: beforeTemplate.status,
        },
        after: {
          title: afterTemplate.title,
          status: afterTemplate.status,
        },
      });

      return afterTemplate;
    }

    return beforeTemplate;
  }

  /**
   * ============================================================
   * Remove Draft Template
   * ============================================================
   */
  removeDraftTemplate(id, userId) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    if (template.status !== "draft") {
      throw new AppError("Only draft templates can be removed", 400);
    }

    const incidentType = incidentTypeRepository.findById(
      template.incident_type_id,
    );

    const activeTemplate = planTemplateRepository.findByIncidentTypeAndStatus(
      template.incident_type_id,
      "approved",
    )[0];

    planTemplateRepository.deleteById(id);

    auditService.log(userId, "DELETE_DRAFT_TEMPLATE", "plan_template", id, {
      title: template.title,
      version: template.version,
      incidentTypeId: template.incident_type_id,
      incidentTypeName: incidentType?.name,
      redirectedToTemplateId: activeTemplate?.id || null,
    });

    return {
      deletedTemplateId: id,
      redirectTemplateId: activeTemplate?.id ?? null,
    };
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

    const beforeStatus = template.status;

    planTemplateRepository.updateById(id, {
      status: "approved",

      approved_by: userId,

      approved_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    });

    const afterTemplate = this.getPlanTemplateById(id);

    auditService.log(userId, "APPROVE_TEMPLATE", "plan_template", id, {
      before: {
        status: beforeStatus,
      },
      after: {
        status: afterTemplate.status,
      },
      approvedBy: userId,
    });

    return afterTemplate;
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

    const existingDrafts = planTemplateRepository.findByIncidentTypeAndStatus(
      template.incident_type_id,
      "draft",
    );

    if (existingDrafts.length > 0) {
      throw new AppError(
        "A draft version already exists for this incident type",
        400,
      );
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

    auditService.log(userId, "CLONE_TEMPLATE", "plan_template", newTemplateId, {
      sourceTemplateId: template.id,
      sourceTitle: template.title,
      sourceVersion: template.version,
      newVersion: latestVersion.version + 1,
    });

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
  retireTemplate(id, userId) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      return false;
    }

    const beforeStatus = template.status;

    planTemplateRepository.updateById(id, {
      status: "retired",
    });

    auditService.log(userId, "RETIRE_TEMPLATE", "plan_template", id, {
      before: {
        status: beforeStatus,
      },
      after: {
        status: "retired",
      },
    });

    return true;
  }

  getTemplateSummary() {
    const rows = planTemplateRepository.findAllWithIncidentType();

    return rows.map((row) => this._toDTO(row));
  }

  getCurrentPlanTemplates() {
    const rows = planTemplateRepository.findLatestWithIncidentType();

    return rows.map((row) => this._toDTO(row));
  }

  getTemplateHistory(templateId) {
    const template = planTemplateRepository.findById(templateId);

    if (!template) {
      return [];
    }

    return planTemplateRepository.findByIncidentTypeId(
      template.incident_type_id,
    );
  }
}

module.exports = new PlanTemplateService();
