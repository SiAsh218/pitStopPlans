const planTemplateRepository = require("../data/repositories/planTemplateRepository.js");
const planStageRepository = require("../data/repositories/planStageRepository.js");
const planStageActionRepository = require("../data/repositories/planStageActionRepository.js");
const incidentTypeRepository = require("../data/repositories/incidentTypeRepository.js");
const AppError = require("../utils/AppError.js");

class PlanService {
  /**
   * ============================================================
   * Build Plan DTO
   * ============================================================
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
   * ============================================================
   * Get Full Plan
   * ============================================================
   */
  getPlan(id) {
    const template = planTemplateRepository.findByIdWithIncidentType(id);

    if (!template) {
      return null;
    }

    const stages = planStageRepository.findByTemplateId(id);

    for (const stage of stages) {
      stage.actions = planStageActionRepository.findByStageIdWithRoles(
        stage.id,
      );
    }

    return this._toDTO(template, stages);
  }

  /**
   * ============================================================
   * Get All Plans
   * ============================================================
   */
  getAllPlans() {
    const templates = planTemplateRepository.findAllWithIncidentType();

    return templates.map((template) => {
      const stages = planStageRepository.findByTemplateId(template.id);

      for (const stage of stages) {
        stage.actions = planStageActionRepository.findByStageIdWithRoles(
          stage.id,
        );
      }

      return this._toDTO(template, stages);
    });
  }

  createPlan(data) {
    const existingIncidentType = incidentTypeRepository.findByName(
      data.incidentType.name,
    );

    if (existingIncidentType) {
      throw new AppError("Incident type already exists", 409);
    }

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
