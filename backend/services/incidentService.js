const AppError = require("../utils/AppError");

const incidentRepository = require("../data/repositories/incidentRepository.js");
const incidentTypeRepository = require("../data/repositories/incidentTypeRepository.js");
const planTemplateRepository = require("../data/repositories/planTemplateRepository.js");
const planStageRepository = require("../data/repositories/planStageRepository.js");
const planStageActionRepository = require("../data/repositories/planStageActionRepository.js");
const incidentActionRepository = require("../data/repositories/incidentActionRepository.js");

const auditService = require("../services/auditLogService");

const eventService = require("../services/eventService.js");

class IncidentService {
  /**
   * Converts a database row into an API DTO.
   *
   * @param {object} row
   * @returns {object}
   */
  _toDTO(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      ccil_number: row.ccil_number ?? null,
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
   * Validates an incident type exists.
   *
   * @param {number} incidentTypeId
   * @returns {object}
   */
  _validateIncidentType(incidentTypeId) {
    const incidentType = incidentTypeRepository.findById(incidentTypeId);

    if (!incidentType) {
      throw new AppError("Incident type not found", 404);
    }

    return incidentType;
  }

  /**
   * Retrieves the latest approved template.
   *
   * @param {number} incidentTypeId
   * @returns {object}
   */
  _getLatestApprovedTemplate(incidentTypeId) {
    const template =
      planTemplateRepository.findLatestApprovedVersionByIncidentType(
        incidentTypeId,
      );

    if (!template) {
      throw new AppError(
        "No approved template exists for this incident type",
        400,
      );
    }

    return template;
  }

  /**
   * Retrieves an incident or throws.
   *
   * @param {number} id
   * @returns {object}
   */
  _getIncidentOrThrow(id) {
    const incident = incidentRepository.findById(id);

    if (!incident) {
      throw new AppError("Incident not found", 404);
    }

    return incident;
  }

  /**
   * Gets summary statistics for actions.
   *
   * @param {Array<object>} actions
   * @returns {object}
   */
  _getActionSummary(actions) {
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    for (const action of actions) {
      switch (action.status) {
        case "completed":
          completed++;
          break;

        case "in_progress":
          inProgress++;
          break;

        default:
          pending++;
      }
    }

    return {
      total_actions: actions.length,
      completed_actions: completed,
      in_progress_actions: inProgress,
      pending_actions: pending,
      completion_percentage:
        actions.length === 0
          ? 0
          : Math.round((completed / actions.length) * 100),
    };
  }

  /**
   * Gets all incidents.
   *
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  getAllIncidents(options = {}) {
    const result = incidentRepository.findAllWithDetailsQuery(options);

    return {
      rows: result.rows.map((incident) => {
        const dto = this._toDTO(incident);

        /**
         * NOTE:
         * Potential N+1 query pattern.
         * Optimise if incident volumes become large.
         */
        const actions = incidentActionRepository.findByIncidentIdWithRoles(
          incident.id,
        );

        dto.summary = this._getActionSummary(actions);

        return dto;
      }),

      meta: result.meta,
    };
  }

  /**
   * Gets an incident by ID.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getIncidentById(id) {
    const incident = incidentRepository.findByIdWithDetails(id);

    if (!incident) {
      return null;
    }

    return this._toDTO(incident);
  }

  /**
   * Creates a new incident.
   *
   * @param {object} data
   * @param {number} userId
   * @returns {object|null}
   */
  createIncident(data, userId) {
    this._validateIncidentType(data.incident_type_id);

    const template = this._getLatestApprovedTemplate(data.incident_type_id);

    let incidentId;

    const transaction = incidentRepository.db.transaction(() => {
      const result = incidentRepository.insertIncident({
        incident_type_id: data.incident_type_id,
        plan_template_id: template.id,
        template_version: template.version,
        title: data.title,
        description: data.description ?? null,
        ccil_number: data.ccil_number ?? null,
        status: "active",
        created_by: userId,
        incident_manager_id: userId,
      });

      incidentId = result.lastInsertRowid;

      this._createIncidentActions(incidentId, template.id);
    });

    transaction();

    const incident = this.getIncidentById(incidentId);

    auditService.log(userId, "CREATE_INCIDENT", "incident", incident.id, {
      title: incident.title,
      incidentTypeId: incident.incident_type.id,
      incidentTypeName: incident.incident_type.name,
      templateVersion: incident.template.version,
      status: incident.status,
    });

    eventService.broadcast({
      type: "incident-created",
      incidentId: incident.id,
    });

    return incident;
  }

  /**
   * Creates runtime incident action snapshots.
   *
   * @param {number} incidentId
   * @param {number} templateId
   * @returns {void}
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

  /**
   * Closes an incident.
   *
   * @param {number} id
   * @param {number} userId
   * @returns {object|null}
   */
  closeIncident(id, userId) {
    const incident = this._getIncidentOrThrow(id);

    if (incident.status === "closed") {
      return this.getIncidentById(id);
    }

    const beforeStatus = incident.status;

    incidentRepository.updateById(id, {
      status: "closed",
      closed_at: new Date().toISOString(),
    });

    const updatedIncident = this.getIncidentById(id);

    auditService.log(userId, "CLOSE_INCIDENT", "incident", id, {
      before: {
        status: beforeStatus,
      },
      after: {
        status: "closed",
      },
      closedAt: updatedIncident.closed_at,
    });

    eventService.broadcast({
      type: "incident-closed",
      incidentId: id,
      userId,
    });

    return updatedIncident;
  }

  /**
   * Reopens an incident.
   *
   * @param {number} id
   * @param {number} userId
   * @returns {object|null}
   */
  reopenIncident(id, userId) {
    const incident = this._getIncidentOrThrow(id);

    if (incident.status === "active") {
      return this.getIncidentById(id);
    }

    incidentRepository.updateById(id, {
      status: "active",
      closed_at: null,
    });

    const beforeStatus = incident.status;

    incidentRepository.updateById(id, {
      status: "active",
      closed_at: null,
    });

    const updatedIncident = this.getIncidentById(id);

    auditService.log(userId, "REOPEN_INCIDENT", "incident", id, {
      before: {
        status: beforeStatus,
      },
      after: {
        status: "active",
      },
    });

    return updatedIncident;
  }

  /**
   * Gets dashboard data for an incident.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getIncidentDashboard(id) {
    const incident = this.getIncidentById(id);

    if (!incident) {
      return null;
    }

    const actions = incidentActionRepository.findByIncidentIdWithRoles(id);

    return {
      incident,
      summary: this._getActionSummary(actions),
      actions,
    };
  }

  updateCcilNumber(id, ccilNumber, userId) {
    const incident = this._getIncidentOrThrow(id);

    const beforeCcilNumber = incident.ccil_number;

    incidentRepository.updateById(id, {
      ccil_number: ccilNumber || null,
    });

    const updatedIncident = this.getIncidentById(id);

    auditService.log(userId, "UPDATE_INCIDENT_CCIL", "incident", id, {
      before: {
        ccilNumber: beforeCcilNumber,
      },
      after: {
        ccilNumber: updatedIncident.ccil_number,
      },
    });

    eventService.broadcast({
      type: "incident-ccil-updated",
      incidentId: id,
      userId,
    });

    return updatedIncident;
  }
}

module.exports = new IncidentService();
