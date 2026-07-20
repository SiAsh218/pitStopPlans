const AppError = require("../utils/AppError");

const incidentActionRepository = require("../data/repositories/incidentActionRepository");

const incidentActionUpdateRepository = require("../data/repositories/incidentActionUpdateRepository");

class IncidentActionUpdateService {
  /**
   * ============================================================
   * Get Updates For Action
   * ============================================================
   */
  getUpdates(incidentActionId) {
    return incidentActionUpdateRepository.findByIncidentActionId(
      incidentActionId,
    );
  }

  /**
   * ============================================================
   * Add Comment
   * ============================================================
   */
  addComment(incidentActionId, userId, note) {
    const action = incidentActionRepository.findById(incidentActionId);

    if (!action) {
      throw new AppError("Incident action not found", 404);
    }

    const result = incidentActionUpdateRepository.insert({
      incident_action_id: incidentActionId,

      user_id: userId,

      update_type: "comment",

      note,

      previous_status: null,

      new_status: null,
    });

    return incidentActionUpdateRepository.findByIdWithDetails(
      result.lastInsertRowid,
    );
  }

  /**
   * ============================================================
   * Add Status Update
   * ============================================================
   */
  addStatusUpdate(incidentActionId, userId, note, previousStatus, newStatus) {
    const action = incidentActionRepository.findById(incidentActionId);

    if (!action) {
      throw new AppError("Incident action not found", 404);
    }

    const result = incidentActionUpdateRepository.insert({
      incident_action_id: incidentActionId,

      user_id: userId,

      update_type: "status_change",

      note,

      previous_status: previousStatus,

      new_status: newStatus,
    });

    return incidentActionUpdateRepository.findByIdWithDetails(
      result.lastInsertRowid,
    );
  }
}

module.exports = new IncidentActionUpdateService();
