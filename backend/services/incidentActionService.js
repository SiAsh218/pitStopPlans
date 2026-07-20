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

  /**
   * ============================================================
   * Start Action
   * ============================================================
   */
  startAction(id, userId) {
    const action = incidentActionRepository.findById(id);

    if (!action) {
      throw new AppError("Action not found", 404);
    }

    if (action.status === "completed") {
      throw new AppError("Completed actions cannot be restarted", 400);
    }

    if (action.status === "in_progress") {
      return this.getById(id);
    }

    incidentActionRepository.updateById(id, {
      status: "in_progress",
      assigned_user_id: userId,
      started_at: new Date().toISOString(),
    });

    /**
     * Create action history entry
     */
    incidentActionUpdateService.addStatusUpdate(
      id,
      userId,
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
  completeAction(id, userId) {
    const action = incidentActionRepository.findById(id);

    if (!action) {
      throw new AppError("Action not found", 404);
    }

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
      assigned_user_id: userId,
      started_at: action.started_at ?? new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    /**
     * Create action history entry
     */
    incidentActionUpdateService.addStatusUpdate(
      id,
      userId,
      "Action completed",
      "in_progress",
      "completed",
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
