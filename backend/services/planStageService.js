const planStageRepository = require("../data/repositories/planStageRepository");

const planTemplateRepository = require("../data/repositories/planTemplateRepository");

const AppError = require("../utils/AppError");

class PlanStageService {
  /**
   * ============================================================
   * Map Row -> DTO
   * ============================================================
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
   * ============================================================
   * Get Stages By Template
   * ============================================================
   */
  getStagesByTemplate(templateId) {
    const rows = planStageRepository.findByTemplateId(templateId);

    return rows.map((row) => this._toDTO(row));
  }

  /**
   * ============================================================
   * Get Stage By ID
   * ============================================================
   */
  getStageById(id) {
    const row = planStageRepository.findById(id);

    if (!row) {
      return null;
    }

    return this._toDTO(row);
  }

  /**
   * ============================================================
   * Create Stage
   * ============================================================
   */
  createStage(data) {
    const template = planTemplateRepository.findById(data.plan_template_id);

    if (!template) {
      throw new AppError("Plan template not found", 404);
    }

    if (template.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }

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

    return {
      id: result.lastInsertRowid,

      plan_template_id: data.plan_template_id,

      stage_number: data.stage_number,

      name: data.name,

      due_from_incident_start: data.due_from_incident_start,
    };
  }

  /**
   * ============================================================
   * Update Stage
   * ============================================================
   */
  updateStage(id, updates) {
    const stage = planStageRepository.findById(id);

    if (!stage) {
      return null;
    }

    const template = planTemplateRepository.findById(stage.plan_template_id);

    if (template && template.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }

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
   * ============================================================
   * Delete Stage
   * ============================================================
   */
  deleteStage(id) {
    const stage = planStageRepository.findById(id);

    if (!stage) {
      return false;
    }

    const template = planTemplateRepository.findById(stage.plan_template_id);

    if (template && template.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }

    const result = planStageRepository.deleteById(id);

    return result.changes > 0;
  }
}

module.exports = new PlanStageService();
