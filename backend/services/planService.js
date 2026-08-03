const planTemplateRepository = require("../data/repositories/planTemplateRepository");
const planStageRepository = require("../data/repositories/planStageRepository");
const planStageActionRepository = require("../data/repositories/planStageActionRepository");
const incidentTypeRepository = require("../data/repositories/incidentTypeRepository");

const AppError = require("../utils/AppError");

class PlanService {
  /**
   * Converts a template and its stages into a DTO.
   *
   * @param {object} template
   * @param {object[]} stages
   * @returns {object}
   */
  _toDTO(template, stages) {
    return {
      id: template.id,
      version: template.version,

      incident_type: {
        id: template.incident_type_id,
        name: template.incident_type_name,
      },

      stages: stages.map((stage) => ({
        id: stage.id,
        stage_number: stage.stage_number,
        name: stage.name,
        due_from_incident_start: stage.due_from_incident_start,
        actions: stage.actions || [],
      })),
    };
  }

  /**
   * Ensures an incident type name does not already exist.
   *
   * @param {string} name
   * @returns {void}
   */
  _validateIncidentTypeDoesNotExist(name) {
    const existing = incidentTypeRepository.findByName(name);

    if (existing) {
      throw new AppError("Incident type already exists", 409);
    }
  }

  /**
   * Builds a complete plan DTO.
   *
   * @param {object} template
   * @returns {object}
   */
  _buildPlan(template) {
    const stages = planStageRepository.findByTemplateId(template.id);

    for (const stage of stages) {
      stage.actions = planStageActionRepository.findByStageIdWithRoles(
        stage.id,
      );
    }

    return this._toDTO(template, stages);
  }

  /**
   * Gets a full plan by template ID.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getPlan(id) {
    const template = planTemplateRepository.findByIdWithIncidentType(id);

    if (!template) {
      return null;
    }

    return this._buildPlan(template);
  }

  /**
   * Gets all plans.
   *
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  getAllPlans(options = {}) {
    const result = planTemplateRepository.findAllWithQuery(options);

    return {
      rows: result.rows.map((template) => this._buildPlan(template)),
      meta: result.meta,
    };
  }

  /**
   * Creates a complete plan.
   *
   * @param {object} data
   * @returns {object}
   */
  createPlan(data) {
    this._validateIncidentTypeDoesNotExist(data.incidentType.name);

    const incidentTypeResult = incidentTypeRepository.insert({
      name: data.incidentType.name,
      description: data.incidentType.description,
    });

    const incidentTypeId = incidentTypeResult.lastInsertRowid;

    const templateResult = planTemplateRepository.insert({
      incident_type_id: incidentTypeId,
      version: 1,
    });

    const templateId = templateResult.lastInsertRowid;

    for (const stage of data.stages) {
      const stageResult = planStageRepository.insert({
        plan_template_id: templateId,
        stage_number: Number(stage.stageNumber),
        name: stage.stageName,
        due_from_incident_start: Number(stage.minsFromIncStart),
      });

      const stageId = stageResult.lastInsertRowid;

      for (const action of stage.actions || []) {
        const actionResult = planStageActionRepository.insert({
          plan_stage_id: stageId,
          action_number: action.actionNumber,
          title: action.title,
          description: action.description,
          due_from_stage_start: action.dueFromStageStart,
          due_from_incident_start: action.dueFromIncidentStart,
        });

        const actionId = actionResult.lastInsertRowid;

        if (action.roleIds?.length) {
          planStageActionRepository.setRoles(actionId, action.roleIds);
        }
      }
    }

    return this.getPlan(templateId);
  }
}

module.exports = new PlanService();
