const planTemplateRepository = require("../data/repositories/planTemplateRepository");
const incidentTypeRepository = require("../data/repositories/incidentTypeRepository");
const planStageRepository = require("../data/repositories/planStageRepository");
const planStageActionRepository = require("../data/repositories/planStageActionRepository");

const auditService = require("../services/auditLogService");

const AppError = require("../utils/AppError");

class PlanTemplateService {
  /**
   * Converts a database row into a DTO.
   *
   * @param {object} row
   * @returns {object}
   */
  _toDTO(row) {
    return {
      id: row.id,
      title: row.title,
      version: row.version,
      revision: row.revision,
      status: row.status,
      role_order: JSON.parse(row.role_order || "[]"),
      created_at: row.created_at,
      approved_at: row.approved_at,

      incident_type: {
        id: row.incident_type_id,
        name: row.incident_type_name,
        description: row.incident_type_description,
      },
      proposed_incident_type:
        row.proposed_incident_type_name !== null &&
        row.proposed_incident_type_name !== undefined
          ? {
              name: row.proposed_incident_type_name,
              description:
                row.proposed_incident_type_description ??
                row.incident_type_description,
            }
          : null,
    };
  }

  /**
   * Gets a template or throws.
   *
   * @param {number} id
   * @returns {object}
   */
  _getTemplateOrThrow(id) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    return template;
  }

  /**
   * Gets an incident type or throws.
   *
   * @param {number} incidentTypeId
   * @returns {object}
   */
  _getIncidentTypeOrThrow(incidentTypeId) {
    const incidentType = incidentTypeRepository.findById(incidentTypeId);

    if (!incidentType) {
      throw new AppError("Incident type not found", 404);
    }

    return incidentType;
  }

  /**
   * Ensures template is editable.
   *
   * @param {object} template
   * @returns {void}
   */
  _ensureEditable(template) {
    if (template.status === "approved") {
      throw new AppError(
        "Approved templates cannot be edited. Create a new version instead.",
        400,
      );
    }
  }

  /**
   * Gets all templates.
   *
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  getAllPlanTemplates(options = {}) {
    const result = planTemplateRepository.findAllWithQuery(options);

    return {
      rows: result.rows.map((row) => this._toDTO(row)),
      meta: result.meta,
    };
  }

  /**
   * Gets a template by ID.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getPlanTemplateById(id) {
    const row = planTemplateRepository.findByIdWithIncidentType(id);

    if (!row) {
      return null;
    }

    return this._toDTO(row);
  }

  /**
   * Creates a template.
   *
   * @param {object} data
   * @param {number} userId
   * @returns {object}
   */
  createPlanTemplate(data, userId) {
    const incidentTypeId = Number(data.incident_type_id);

    if (!Number.isInteger(incidentTypeId) || incidentTypeId <= 0) {
      throw new AppError("Invalid incident type id", 400);
    }

    this._getIncidentTypeOrThrow(incidentTypeId);

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
   * Updates a draft template.
   *
   * @param {number} id
   * @param {object} updates
   * @param {number} userId
   * @returns {object|null}
   */
  updatePlanTemplate(id, updates, userId) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      return null;
    }

    this._ensureEditable(template);

    const beforeTemplate = this.getPlanTemplateById(id);

    const fields = {};

    if (updates.title !== undefined) {
      fields.title = updates.title;
    }

    if (updates.status !== undefined) {
      fields.status = updates.status;
    }

    if (updates.role_order !== undefined) {
      if (
        !Array.isArray(updates.role_order) ||
        updates.role_order.some(
          (roleId) => !Number.isSafeInteger(roleId) || roleId <= 0,
        ) ||
        new Set(updates.role_order).size !== updates.role_order.length
      ) {
        throw new AppError("Invalid role order", 400);
      }

      const currentRoleIds = new Set(
        planStageRepository
          .findByTemplateId(id)
          .flatMap((stage) =>
            planStageActionRepository
              .findByStageId(stage.id)
              .flatMap((action) =>
                planStageActionRepository
                  .getRoles(action.id)
                  .map((role) => role.id),
              ),
          ),
      );

      if (
        updates.role_order.length !== currentRoleIds.size ||
        updates.role_order.some((roleId) => !currentRoleIds.has(roleId))
      ) {
        throw new AppError(
          "Role order must include every template role exactly once",
          400,
        );
      }

      fields.role_order = JSON.stringify(updates.role_order);
    }

    if (updates.proposed_incident_type !== undefined) {
      const proposed = updates.proposed_incident_type;
      const name = proposed?.name?.trim();
      const description = proposed?.description?.trim();

      if (!name || description === undefined) {
        throw new AppError(
          "Incident type name and description are required",
          400,
        );
      }

      const existingType = incidentTypeRepository.findByName(name);
      if (
        existingType &&
        existingType.id !== template.incident_type_id
      ) {
        throw new AppError("Incident type already exists", 409);
      }

      fields.proposed_incident_type_name = name;
      fields.proposed_incident_type_description = description;
    }

    if (Object.keys(fields).length === 0) {
      return beforeTemplate;
    }

    planTemplateRepository.updateById(id, fields);

    const afterTemplate = this.getPlanTemplateById(id);

    auditService.log(userId, "UPDATE_TEMPLATE", "plan_template", id, {
      before: {
        title: beforeTemplate.title,
        status: beforeTemplate.status,
        role_order: beforeTemplate.role_order,
      },
      after: {
        title: afterTemplate.title,
        status: afterTemplate.status,
        role_order: afterTemplate.role_order,
      },
    });

    return afterTemplate;
  }

  /**
   * Removes a draft template.
   *
   * @param {number} id
   * @param {number} userId
   * @returns {object}
   */
  removeDraftTemplate(id, userId) {
    const template = this._getTemplateOrThrow(id);

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
   * Approves a template.
   *
   * @param {number} id
   * @param {number} userId
   * @returns {object}
   */
  approveTemplate(id, userId) {
    const template = this._getTemplateOrThrow(id);

    if (template.status === "approved") {
      throw new AppError("Template already approved", 400);
    }

    const beforeStatus = template.status;
    const approvalDate = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const incidentType = incidentTypeRepository.findById(
      template.incident_type_id,
    );
    const proposedName = template.proposed_incident_type_name;
    const proposedDescription = template.proposed_incident_type_description;
    const applyIncidentTypeChanges =
      proposedName !== null &&
      proposedName !== undefined &&
      incidentType !== null &&
      incidentType !== undefined;
    const conflictingIncidentType = applyIncidentTypeChanges
      ? incidentTypeRepository.findByName(proposedName)
      : null;

    if (
      conflictingIncidentType &&
      conflictingIncidentType.id !== template.incident_type_id
    ) {
      throw new AppError("Incident type already exists", 409);
    }

    const approve = planTemplateRepository.db.transaction(() => {
      if (applyIncidentTypeChanges) {
        incidentTypeRepository.updateById(template.incident_type_id, {
          name: proposedName,
          description: proposedDescription ?? incidentType.description,
        });
        planTemplateRepository.updateTitlesByIncidentType(
          template.incident_type_id,
          proposedName,
        );
      }

      planTemplateRepository.updateById(id, {
        status: "approved",
        approved_by: userId,
        approved_at: approvalDate,
        proposed_incident_type_name: null,
        proposed_incident_type_description: null,
      });
    });
    approve();

    const afterTemplate = this.getPlanTemplateById(id);

    auditService.log(userId, "APPROVE_TEMPLATE", "plan_template", id, {
      before: {
        status: beforeStatus,
        incidentTypeName: incidentType?.name,
      },
      after: {
        status: afterTemplate.status,
        incidentTypeName: afterTemplate.incident_type.name,
      },
      approvedBy: userId,
    });

    return afterTemplate;
  }

  /**
   * Clone template.
   *
   * Creates:
   * - New template version
   * - Copies stages
   * - Copies actions
   * - Copies role assignments
   */
  cloneTemplate(id, userId) {
    const template = this._getTemplateOrThrow(id);

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

    let newTemplateId;
    let nextVersion;

    const transaction = planTemplateRepository.db.transaction(() => {
      const latestVersion =
        planTemplateRepository.findLatestVersionByIncidentType(
          template.incident_type_id,
        );

      nextVersion = latestVersion.version + 1;

      const templateResult = planTemplateRepository.insert({
        incident_type_id: template.incident_type_id,
        version: nextVersion,
        title: template.title,
        status: "draft",
        role_order: template.role_order || "[]",
        created_by: userId,
      });

      newTemplateId = templateResult.lastInsertRowid;

      const stages = planStageRepository.findByTemplateId(template.id);

      for (const stage of stages) {
        const newStage = planStageRepository.cloneStage(
          stage.id,
          newTemplateId,
        );

        const actions = planStageActionRepository.findByStageId(stage.id);

        for (const action of actions) {
          planStageActionRepository.cloneAction(action.id, newStage.id);
        }
      }
    });

    transaction();

    auditService.log(userId, "CLONE_TEMPLATE", "plan_template", newTemplateId, {
      sourceTemplateId: template.id,
      sourceTitle: template.title,
      sourceVersion: template.version,
      newVersion: nextVersion,
    });

    return this.getPlanTemplateById(newTemplateId);
  }

  /**
   * Retires a template.
   *
   * @param {number} id
   * @param {number} userId
   * @returns {boolean}
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

  /**
   * Reinstates a retired template.
   *
   * @param {number} id
   * @param {number} userId
   * @returns {boolean}
   */
  reinstateTemplate(id, userId) {
    const template = planTemplateRepository.findById(id);

    if (!template) {
      return false;
    }

    if (template.status !== "retired") {
      throw new AppError("Only retired templates can be reinstated", 400);
    }

    planTemplateRepository.updateById(id, {
      status: "approved",
    });

    auditService.log(userId, "REINSTATE_TEMPLATE", "plan_template", id, {
      before: {
        status: "retired",
      },
      after: {
        status: "approved",
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
