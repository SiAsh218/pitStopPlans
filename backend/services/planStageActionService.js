const AppError = require("../utils/AppError");

const roleRepository = require("../data/repositories/roleRepository");
const planTemplateRepository = require("../data/repositories/planTemplateRepository");
const planStageRepository = require("../data/repositories/planStageRepository");
const planStageActionRepository = require("../data/repositories/planStageActionRepository");

class PlanStageActionService {
  _getActionDueTimes(stage, dueFromStageStart) {
    const stages = planStageRepository
      .findByTemplateId(stage.plan_template_id)
      .sort((a, b) => a.stage_number - b.stage_number);
    const stageIndex = stages.findIndex((item) => item.id === stage.id);
    const stageStart = Number(
      stages[stageIndex - 1]?.due_from_incident_start ?? 0,
    );
    const stageEnd = Number(stage.due_from_incident_start);
    const offset = Number(dueFromStageStart);
    const maxOffset = stageEnd - stageStart;

    if (
      stageIndex < 0 ||
      !Number.isInteger(offset) ||
      offset < 0 ||
      !Number.isFinite(maxOffset) ||
      maxOffset < 0 ||
      offset > maxOffset
    ) {
      throw new AppError(
        `Action due time must be between 0 and ${Math.max(0, maxOffset)} minutes after stage start`,
        400,
      );
    }

    return {
      due_from_stage_start: offset,
      due_from_incident_start: stageStart + offset,
    };
  }

  /**
   * Gets a stage or throws.
   *
   * @param {number} stageId
   * @returns {object}
   */
  _getStageOrThrow(stageId) {
    const stage = planStageRepository.findById(stageId);

    if (!stage) {
      throw new AppError("Stage not found", 404);
    }

    return stage;
  }

  /**
   * Ensures a template can still be modified.
   *
   * @param {number} templateId
   * @returns {void}
   */
  _ensureTemplateEditable(templateId) {
    const template = planTemplateRepository.findById(templateId);

    if (template?.status === "approved") {
      throw new AppError("Approved templates cannot be modified", 400);
    }
  }

  /**
   * Validates role IDs.
   *
   * @param {number[]} roleIds
   * @returns {void}
   */
  _validateRoles(roleIds = []) {
    for (const roleId of roleIds) {
      const role = roleRepository.findById(roleId);

      if (!role) {
        throw new AppError(`Role ${roleId} not found`, 404);
      }
    }
  }

  /**
   * Gets actions for a stage.
   *
   * @param {number} stageId
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  getActionsByStage(stageId, options = {}) {
    return planStageActionRepository.findByStageIdWithRolesQuery(
      stageId,
      options,
    );
  }

  /**
   * Gets an action by ID.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getActionById(id) {
    return planStageActionRepository.getWithRoles(id);
  }

  /**
   * Creates a stage action.
   *
   * @param {object} data
   * @returns {object}
   */
  createAction(data) {
    const stage = this._getStageOrThrow(data.plan_stage_id);

    this._ensureTemplateEditable(stage.plan_template_id);
    const dueTimes = this._getActionDueTimes(stage, data.due_from_stage_start);

    const duplicate = planStageActionRepository.findByStageAndActionNumber(
      data.plan_stage_id,
      data.action_number,
    );

    if (duplicate) {
      throw new AppError("Action number already exists", 409);
    }

    this._validateRoles(data.role_ids);

    const result = planStageActionRepository.insert({
      plan_stage_id: data.plan_stage_id,
      action_number: data.action_number,
      title: data.title,
      description: data.description,
      ...dueTimes,
    });

    planStageActionRepository.setRoles(result.lastInsertRowid, data.role_ids);

    return planStageActionRepository.getWithRoles(result.lastInsertRowid);
  }

  /**
   * Updates a stage action.
   *
   * @param {number} id
   * @param {object} updates
   * @returns {object|null}
   */
  updateAction(id, updates) {
    const existing = planStageActionRepository.findById(id);

    if (!existing) {
      return null;
    }

    const stage = this._getStageOrThrow(existing.plan_stage_id);

    this._ensureTemplateEditable(stage.plan_template_id);
    const dueTimes = this._getActionDueTimes(
      stage,
      updates.due_from_stage_start ?? existing.due_from_stage_start,
    );

    planStageActionRepository.updateById(id, {
      action_number: updates.action_number ?? existing.action_number,

      title: updates.title ?? existing.title,

      description: updates.description ?? existing.description,

      ...dueTimes,
    });

    if (Array.isArray(updates.role_ids)) {
      this._validateRoles(updates.role_ids);

      planStageActionRepository.setRoles(id, updates.role_ids);
    }

    return planStageActionRepository.getWithRoles(id);
  }

  reorderActions(stageId, actionIds) {
    const stage = this._getStageOrThrow(stageId);

    this._ensureTemplateEditable(stage.plan_template_id);

    const currentIds = planStageActionRepository
      .findByStageId(stageId)
      .map((action) => action.id);
    const requestedIds = [...actionIds].sort((a, b) => a - b);
    const expectedIds = [...currentIds].sort((a, b) => a - b);

    if (
      requestedIds.length !== expectedIds.length ||
      requestedIds.some((id, index) => id !== expectedIds[index])
    ) {
      throw new AppError(
        "Action order must include every action exactly once",
        400,
      );
    }

    planStageActionRepository.reorderForStage(stageId, actionIds);

    return planStageActionRepository.findByStageIdWithRoles(stageId);
  }

  /**
   * Deletes a stage action.
   *
   * @param {number} id
   * @returns {boolean}
   */
  deleteAction(id) {
    const existing = planStageActionRepository.findById(id);

    if (!existing) {
      return false;
    }

    const stage = this._getStageOrThrow(existing.plan_stage_id);

    this._ensureTemplateEditable(stage.plan_template_id);

    return planStageActionRepository.deleteById(id).changes > 0;
  }
}

module.exports = new PlanStageActionService();
