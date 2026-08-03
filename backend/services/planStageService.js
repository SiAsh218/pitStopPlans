const planStageRepository = require("../data/repositories/planStageRepository");
const planTemplateRepository = require("../data/repositories/planTemplateRepository");

const AppError = require("../utils/AppError");

class PlanStageService {
  /**
   * Converts a database row into an API DTO.
   *
   * @param {object} row
   * @returns {object}
   */
  _toDTO(row) {
    return {
      id: row.id,
      plan_template_id: row.plan_template_id,
      stage_number: row.stage_number,
      name: row.name,
      due_from_incident_start: row.due_from_incident_start,
    };
  }

  /**
   * Retrieves a template and ensures it can be modified.
   *
   * @param {number} templateId
   * @returns {object}
   */
  _getEditableTemplateOrThrow(templateId) {
    const template = planTemplateRepository.findById(templateId);

    if (!template) {
      throw new AppError("Plan template not found", 404);
    }

    if (template.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }

    return template;
  }

  /**
   * Gets stages for a template.
   *
   * @param {number} templateId
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  getStagesByTemplate(templateId, options = {}) {
    const result = planStageRepository.findByTemplateIdWithQuery(
      templateId,
      options,
    );

    return {
      rows: result.rows.map((row) => this._toDTO(row)),
      meta: result.meta,
    };
  }

  /**
   * Gets a stage by ID.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getStageById(id) {
    const row = planStageRepository.findById(id);

    if (!row) {
      return null;
    }

    return this._toDTO(row);
  }

  /**
   * Creates a stage.
   *
   * @param {object} data
   * @returns {object}
   */
  createStage(data) {
    this._getEditableTemplateOrThrow(data.plan_template_id);

    const existing = planStageRepository.findByTemplateAndStageNumber(
      data.plan_template_id,
      data.stage_number,
    );

    if (existing) {
      throw new AppError("Stage number already exists", 409);
    }

    const result = planStageRepository.insert({
      plan_template_id: data.plan_template_id,
      stage_number: data.stage_number,
      name: data.name,
      due_from_incident_start: data.due_from_incident_start,
    });

    return this._toDTO({
      id: result.lastInsertRowid,
      plan_template_id: data.plan_template_id,
      stage_number: data.stage_number,
      name: data.name,
      due_from_incident_start: data.due_from_incident_start,
    });
  }

  /**
   * Updates a stage.
   *
   * @param {number} id
   * @param {object} updates
   * @returns {object|null}
   */
  updateStage(id, updates) {
    const stage = planStageRepository.findById(id);

    if (!stage) {
      return null;
    }

    this._getEditableTemplateOrThrow(stage.plan_template_id);

    const updated = {
      stage_number: updates.stage_number ?? stage.stage_number,

      name: updates.name ?? stage.name,

      due_from_incident_start:
        updates.due_from_incident_start ?? stage.due_from_incident_start,
    };

    const existing = planStageRepository.findByTemplateAndStageNumber(
      stage.plan_template_id,
      updated.stage_number,
    );

    if (existing && existing.id !== id) {
      throw new AppError("Stage number already exists", 409);
    }

    planStageRepository.updateById(id, updated);

    return this.getStageById(id);
  }

  /**
   * Deletes a stage.
   *
   * @param {number} id
   * @returns {boolean}
   */
  deleteStage(id) {
    const stage = planStageRepository.findById(id);

    if (!stage) {
      return false;
    }

    this._getEditableTemplateOrThrow(stage.plan_template_id);

    const result = planStageRepository.deleteById(id);

    return result.changes > 0;
  }
}

module.exports = new PlanStageService();
