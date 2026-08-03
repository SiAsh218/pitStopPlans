const auditLogRepository = require("../data/repositories/auditLogRepository");

class AuditService {
  log(userId, action, entityType, entityId, details = {}) {
    return auditLogRepository.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: JSON.stringify(details),
    });
  }

  getRecent(options = {}) {
    if (typeof options === "number") {
      return auditLogRepository.getRecent(options);
    }

    return auditLogRepository.findRecentWithQuery(options);
  }
}

module.exports = new AuditService();
