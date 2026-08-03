const AppError = require("../utils/AppError");

const incidentActionRepository = require("../data/repositories/incidentActionRepository");

const incidentActionUpdateRepository = require("../data/repositories/incidentActionUpdateRepository");

class IncidentActionUpdateService {
  /**
   * Retrieves an incident action or throws.
   *
   * @param {number} incidentActionId
   * @returns {object}
   */
  _getActionOrThrow(incidentActionId) {
    const action = incidentActionRepository.findById(incidentActionId);

    if (!action) {
      throw new AppError("Incident action not found", 404);
    }

    return action;
  }

  /**
   * Gets updates for an incident action.
   *
   * @param {number} incidentActionId
   * @param {object} [options={}]
   * @returns {object}
   */
  getUpdates(incidentActionId, options = {}) {
    return incidentActionUpdateRepository.findByIncidentActionIdWithQuery(
      incidentActionId,
      options,
    );
  }

  /**
   * Adds a comment update.
   *
   * @param {number} incidentActionId
   * @param {number} userId
   * @param {string} note
   * @returns {object}
   */
  addComment(incidentActionId, userId, note) {
    this._getActionOrThrow(incidentActionId);

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
   * Adds a status change update.
   *
   * @param {number} incidentActionId
   * @param {number} userId
   * @param {string} note
   * @param {string|null} previousStatus
   * @param {string|null} newStatus
   * @returns {object}
   */
  addStatusUpdate(incidentActionId, userId, note, previousStatus, newStatus) {
    this._getActionOrThrow(incidentActionId);

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
