const AppError = require("../utils/AppError");

const incidentRepository = require("../data/repositories/incidentRepository");
const incidentTypeRepository = require("../data/repositories/incidentTypeRepository");
const planTemplateRepository = require("../data/repositories/planTemplateRepository");
const planStageRepository = require("../data/repositories/planStageRepository");
const planStageActionRepository = require("../data/repositories/planStageActionRepository");
const incidentActionRepository = require("../data/repositories/incidentActionRepository");
// const auditLogRepository = require("../data/repositories/auditLogRepository");

class IncidentService {
  /**
   * Convert DB row to API DTO
   */
  _toDTO(row) {
    return {
      id: row.id,

      title: row.title,

      description: row.description,

      status: row.status,

      started_at: row.started_at,

      closed_at: row.closed_at,

      incident_type: {
        id: row.incident_type_id,
        name: row.incident_type_name,
      },

      template: {
        id: row.plan_template_id,
        version: row.template_version,
      },

      created_by: {
        id: row.created_by,
        email: row.created_by_email,
      },
    };
  }

  /**
   * Get all incidents
   */
  getAllIncidents() {
    const incidents = incidentRepository.findAllWithDetails();

    return incidents.map((incident) => this._toDTO(incident));
  }

  /**
   * Get incident by id
   */
  getIncidentById(id) {
    const incident = incidentRepository.findByIdWithDetails(id);

    if (!incident) {
      return null;
    }

    return this._toDTO(incident);
  }

  /**
   * Create incident
   */
  createIncident(data, userId) {
    const incidentType = incidentTypeRepository.findById(data.incident_type_id);

    if (!incidentType) {
      throw new AppError("Incident type not found", 404);
    }

    /**
     * Find latest approved template
     */
    const template =
      planTemplateRepository.findLatestApprovedVersionByIncidentType(
        data.incident_type_id,
      );

    if (!template) {
      throw new AppError(
        "No approved template exists for this incident type",
        400,
      );
    }

    /**
     * Create Incident
     */
    const result = incidentRepository.insertIncident({
      incident_type_id: data.incident_type_id,
      plan_template_id: template.id,
      template_version: template.version,
      title: data.title,
      description: data.description ?? null,
      status: "active",
      created_by: userId,
      incident_manager_id: userId,
    });

    const incidentId = result.lastInsertRowid;

    /**
     * Create action snapshots
     */
    this._createIncidentActions(incidentId, template.id);

    /**
     * Audit record
     */
    // if (auditLogRepository?.insert) {
    //   auditLogRepository.insert({
    //     user_id: userId,
    //     entity_type: "incident",
    //     entity_id: incidentId,
    //     action: "create",
    //     field_name: null,
    //     old_value: null,
    //     new_value: "active",
    //   });
    // }

    return this.getIncidentById(incidentId);
  }

  /**
   * Create runtime incident action snapshots
   */
  _createIncidentActions(incidentId, templateId) {
    const stages = planStageRepository.findByTemplateId(templateId);

    for (const stage of stages) {
      const actions = planStageActionRepository.findByStageId(stage.id);

      for (const action of actions) {
        incidentActionRepository.insert({
          incident_id: incidentId,
          original_action_id: action.id,
          stage_number: stage.stage_number,
          stage_name: stage.name,
          stage_due_from_incident_start: stage.due_from_incident_start,
          action_number: action.action_number,
          title: action.title,
          description: action.description,
          due_from_stage_start: action.due_from_stage_start,
          due_from_incident_start: action.due_from_incident_start,
          status: "pending",
          assigned_user_id: null,
          started_at: null,
          completed_at: null,
        });
      }
    }
  }

  closeIncident(id, userId) {
    const incident = incidentRepository.findById(id);

    if (!incident) {
      throw new AppError("Incident not found", 404);
    }

    if (incident.status === "closed") {
      return this.getIncidentById(id);
    }

    incidentRepository.updateById(id, {
      status: "closed",
      closed_at: new Date().toISOString(),
    });

    return this.getIncidentById(id);
  }

  getIncidentDashboard(id) {
    const incident = this.getIncidentById(id);

    if (!incident) {
      return null;
    }

    const actions = incidentActionRepository.findByIncidentIdWithRoles(id);

    const completed = actions.filter((a) => a.status === "completed").length;

    const inProgress = actions.filter((a) => a.status === "in_progress").length;

    const pending = actions.filter((a) => a.status === "pending").length;

    return {
      incident,

      summary: {
        total_actions: actions.length,
        completed_actions: completed,
        in_progress_actions: inProgress,
        pending_actions: pending,

        completion_percentage:
          actions.length === 0
            ? 0
            : Math.round((completed / actions.length) * 100),
      },

      actions,
    };
  }
}

module.exports = new IncidentService();
