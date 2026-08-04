const AppError = require("../utils/AppError");

const incidentActionRepository = require("../data/repositories/incidentActionRepository");

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

    eventService.broadcast({
      type: "incident-action-updated",
      incidentId: action.incident_id,
      actionId: id,
      status: "in_progress",
    });

    return this.getById(id);
  }

  completeAction(id, user) {
    const action = this._getActionOrThrow(id);

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

    eventService.broadcast({
      type: "incident-action-updated",
      incidentId: action.incident_id,
      actionId: id,
      status: "completed",
    });

    return this.getById(id);
  }

  reopenAction(id, user) {
    const action = this._getActionOrThrow(id);

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

    eventService.broadcast({
      type: "incident-action-updated",
      incidentId: action.incident_id,
      actionId: id,
      status: "in_progress",
    });

    return this.getById(id);
  }

  assignAction(id, userId) {
    const action = this._getActionOrThrow(id);

    incidentActionRepository.updateById(id, {
      assigned_user_id: userId,
    });

    eventService.broadcast({
      type: "incident-action-assigned",
      incidentId: action.incident_id,
      actionId: id,
      assignedUserId: userId,
    });

    return this.getById(id);
  }
}

module.exports = new IncidentActionService();
