const AppError = require("../utils/AppError");

const incidentActionRepository = require("../data/repositories/incidentActionRepository");
const incidentRepository = require("../data/repositories/incidentRepository");

const incidentService = require("./incidentService");
const incidentActionUpdateService = require("./incidentActionUpdateService");

const eventService = require("../services/eventService.js");

class IncidentActionService {
  /**
   * Get action or throw.
   *
   * @param {number} id
   * @returns {object}
   */
  _getActionOrThrow(id) {
    const action = incidentActionRepository.findById(id);

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    return action;
  }

  /**
   * Validates user can update an action.
   *
   * @param {number} actionId
   * @param {object} user
   * @returns {void}
   */
  _validateUserCanUpdateAction(actionId, user) {
    if (user.role === "admin") {
      return;
    }

    const actionRoles = incidentActionRepository.getRoles(actionId);

    if (actionRoles.length === 0) {
      throw new AppError("Action has no assigned roles", 403);
    }

    const actionRoleIds = actionRoles.map((role) => role.id);

    const authorised = user.jobRoles.some((roleId) =>
      actionRoleIds.includes(roleId),
    );

    if (!authorised) {
      throw new AppError("You are not authorised to update this action", 403);
    }
  }

  _validateIncidentIsActive(incidentId) {
    const incident = incidentRepository.findById(incidentId);

    if (!incident) {
      throw new AppError("Incident not found", 404);
    }

    if (incident.status !== "active") {
      throw new AppError("Actions cannot be updated on a closed incident", 400);
    }
  }

  getByIncident(incidentId, options = {}) {
    return incidentActionRepository.findByIncidentIdWithRolesQuery(
      incidentId,
      options,
    );
  }

  getById(id) {
    return incidentActionRepository.findByIdWithDetails(id);
  }

  startAction(id, user) {
    const action = this._getActionOrThrow(id);

    this._validateIncidentIsActive(action.incident_id);

    this._validateUserCanUpdateAction(id, user);

    if (action.status === "completed") {
      throw new AppError("Completed actions cannot be restarted", 400);
    }

    if (action.status === "in_progress") {
      return this.getById(id);
    }

    incidentActionRepository.updateById(id, {
      status: "in_progress",
      assigned_user_id: user.id,
      started_at: new Date().toISOString(),
    });

    incidentActionUpdateService.addStatusUpdate(
      id,
      user.id,
      "Action started",
      "pending",
      "in_progress",
    );

    const incident = incidentService.getIncidentForDashboard(
      action.incident_id,
    );

    const stats = incidentService.getDashboardStatistics();

    eventService.broadcast({
      type: "incident-action-updated",
      incidentId: action.incident_id,
      incident,
      stats,
      actionId: id,
      status: "in_progress",
    });

    return this.getById(id);
  }

  completeAction(id, user) {
    const action = this._getActionOrThrow(id);

    this._validateIncidentIsActive(action.incident_id);

    this._validateUserCanUpdateAction(id, user);

    if (action.status === "completed") {
      return this.getById(id);
    }

    if (action.status === "pending") {
      throw new AppError(
        "Action must be started before it can be completed",
        400,
      );
    }

    incidentActionRepository.updateById(id, {
      status: "completed",
      assigned_user_id: user.id,
      started_at: action.started_at ?? new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    incidentActionUpdateService.addStatusUpdate(
      id,
      user.id,
      "Action completed",
      "in_progress",
      "completed",
    );

    const incident = incidentService.getIncidentForDashboard(
      action.incident_id,
    );

    const stats = incidentService.getDashboardStatistics();

    eventService.broadcast({
      type: "incident-action-updated",
      incidentId: action.incident_id,
      incident,
      stats,
      actionId: id,
      status: "completed",
    });

    return this.getById(id);
  }

  reopenAction(id, user) {
    const action = this._getActionOrThrow(id);

    this._validateIncidentIsActive(action.incident_id);

    this._validateUserCanUpdateAction(id, user);

    if (action.status !== "completed") {
      throw new AppError("Only completed actions can be reopened", 400);
    }

    incidentActionRepository.updateById(id, {
      status: "in_progress",
      assigned_user_id: user.id,
      completed_at: null,
    });

    incidentActionUpdateService.addStatusUpdate(
      id,
      user.id,
      "Action reopened",
      "completed",
      "in_progress",
    );

    const incident = incidentService.getIncidentForDashboard(
      action.incident_id,
    );

    const stats = incidentService.getDashboardStatistics();

    eventService.broadcast({
      type: "incident-action-updated",
      incidentId: action.incident_id,
      incident,
      stats,
      actionId: id,
      status: "in_progress",
    });

    return this.getById(id);
  }

  assignAction(id, userId) {
    const action = this._getActionOrThrow(id);

    this._validateIncidentIsActive(action.incident_id);

    incidentActionRepository.updateById(id, {
      assigned_user_id: userId,
    });

    const incident = incidentService.getIncidentForDashboard(
      action.incident_id,
    );

    const stats = incidentService.getDashboardStatistics();

    eventService.broadcast({
      type: "incident-action-assigned",
      incidentId: action.incident_id,
      incident,
      stats,
      actionId: id,
      assignedUserId: userId,
    });

    return this.getById(id);
  }
}

module.exports = new IncidentActionService();
