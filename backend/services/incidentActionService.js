const AppError = require("../utils/AppError");

const incidentActionRepository = require("../data/repositories/incidentActionRepository");

const incidentActionUpdateService = require("./incidentActionUpdateService");

class IncidentActionService {
  /**
   * ============================================================
   * Get Actions For Incident
   * ============================================================
   */
  getByIncident(incidentId) {
    return incidentActionRepository.findByIncidentId(incidentId);
  }

  /**
   * ============================================================
   * Get Action By ID
   * ============================================================
   */
  getById(id) {
    return incidentActionRepository.findByIdWithDetails(id);
  }

  validateUserCanUpdateAction(actionId, user) {
    // Admins can do everything
    if (user.role === "admin") {
      return;
    }

    const actionRoles = incidentActionRepository.getRoles(actionId);

    // No roles assigned to action
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

  /**
   * ============================================================
   * Start Action
   * ============================================================
   */
  startAction(id, user) {
    const action = incidentActionRepository.findById(id);

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    this.validateUserCanUpdateAction(id, user);

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

    /**
     * Create action history entry
     */
    incidentActionUpdateService.addStatusUpdate(
      id,
      user.id,
      "Action started",
      "pending",
      "in_progress",
    );

    return this.getById(id);
  }

  /**
   * ============================================================
   * Complete Action
   * ============================================================
   */
  completeAction(id, user) {
    const action = incidentActionRepository.findById(id);

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    this.validateUserCanUpdateAction(id, user);

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

    /**
     * Create action history entry
     */
    incidentActionUpdateService.addStatusUpdate(
      id,
      user.id,
      "Action completed",
      "in_progress",
      "completed",
    );

    return this.getById(id);
  }

  /**
   * ============================================================
   * Reopen Action
   * ============================================================
   */
  reopenAction(id, user) {
    const action = incidentActionRepository.findById(id);

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    this.validateUserCanUpdateAction(id, user);

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

    return this.getById(id);
  }

  /**
   * ============================================================
   * Assign Action
   * ============================================================
   */
  assignAction(id, userId) {
    const action = incidentActionRepository.findById(id);

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    incidentActionRepository.updateById(id, {
      assigned_user_id: userId,
    });

    return this.getById(id);
  }
}

module.exports = new IncidentActionService();
