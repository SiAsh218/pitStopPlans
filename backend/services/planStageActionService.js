const AppError = require("../utils/AppError");

const roleRepository = require("../data/repositories/roleRepository");

const planTemplateRepository = require("../data/repositories/planTemplateRepository");

const planStageRepository = require("../data/repositories/planStageRepository");

const planStageActionRepository = require("../data/repositories/planStageActionRepository");

class PlanStageActionService {
  /**
   * ============================================================
   * Get Actions By Stage
   * ============================================================
   */
  getActionsByStage(stageId) {
    return planStageActionRepository.findByStageIdWithRoles(stageId);
  }

  /**
   * ============================================================
   * Get Action By ID
   * ============================================================
   */
  getActionById(id) {
    return planStageActionRepository.getWithRoles(id);
  }

  /**
   * ============================================================
   * Create Action
   * ============================================================
   */
  createAction(data) {
    const stage = planStageRepository.findById(data.plan_stage_id);

    if (!stage) {
      throw new AppError("Stage not found", 404);
    }

    const template = planTemplateRepository.findById(stage.plan_template_id);

    if (template && template.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }

    const duplicate = planStageActionRepository.findByStageAndActionNumber(
      data.plan_stage_id,
      data.action_number,
    );

    if (duplicate) {
      throw new AppError("Action number already exists", 409);
    }

    for (const roleId of data.role_ids) {
      const role = roleRepository.findById(roleId);

      if (!role) {
        throw new AppError(`Role ${roleId} not found`, 404);
      }
    }

    const result = planStageActionRepository.insert({
      plan_stage_id: data.plan_stage_id,

      action_number: data.action_number,

      title: data.title,

      description: data.description,

      due_from_stage_start: data.due_from_stage_start,

      due_from_incident_start: data.due_from_incident_start,
    });

    planStageActionRepository.setRoles(result.lastInsertRowid, data.role_ids);

    return planStageActionRepository.getWithRoles(result.lastInsertRowid);
  }

  /**
   * ============================================================
   * Update Action
   * ============================================================
   */
  updateAction(id, updates) {
    const existing = planStageActionRepository.findById(id);

    if (!existing) {
      return null;
    }

    const stage = planStageRepository.findById(existing.plan_stage_id);

    const template = planTemplateRepository.findById(stage.plan_template_id);

    if (template && template.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }

    planStageActionRepository.updateById(id, {
      action_number: updates.action_number ?? existing.action_number,

      title: updates.title ?? existing.title,

      description: updates.description ?? existing.description,

      due_from_stage_start:
        updates.due_from_stage_start ?? existing.due_from_stage_start,

      due_from_incident_start:
        updates.due_from_incident_start ?? existing.due_from_incident_start,
    });

    if (Array.isArray(updates.role_ids)) {
      for (const roleId of updates.role_ids) {
        const role = roleRepository.findById(roleId);

        if (!role) {
          throw new AppError(`Role ${roleId} not found`, 404);
        }
      }

      planStageActionRepository.setRoles(id, updates.role_ids);
    }

    return planStageActionRepository.getWithRoles(id);
  }

  /**
   * ============================================================
   * Delete Action
   * ============================================================
   */
  deleteAction(id) {
    const existing = planStageActionRepository.findById(id);

    if (!existing) {
      return false;
    }

    const stage = planStageRepository.findById(existing.plan_stage_id);

    const template = planTemplateRepository.findById(stage.plan_template_id);

    if (template && template.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }

    return planStageActionRepository.deleteById(id).changes > 0;
  }
}

module.exports = new PlanStageActionService();
