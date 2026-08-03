const auditLogRepository = require("../data/repositories/auditLogRepository");

/**
 * Handles audit log business operations.
 */
class AuditLogService {
  /**
   * Creates an audit log entry.
   *
   * @param {number} userId
   * @param {string} action
   * @param {string} entityType
   * @param {number|null} entityId
   * @param {object} [details={}]
   * @returns {object}
   */
  log(userId, action, entityType, entityId, details = {}) {
    return auditLogRepository.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: JSON.stringify(details),
    });
  }

  /**
   * Retrieves recent audit logs.
   *
   * @param {object|number} [options={}]
   * @returns {object}
   */
  getRecent(options = {}) {
    if (typeof options === "number") {
      return auditLogRepository.getRecent(options);
    }

    return auditLogRepository.findRecentWithQuery(options);
  }
}

module.exports = new AuditLogService();
