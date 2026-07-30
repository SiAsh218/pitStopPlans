const BaseRepository = require("./baseRepository");

class AuditLogRepository extends BaseRepository {
  constructor() {
    super("audit_logs");
  }

  create(entry) {
    return this.insert(entry);
  }
}

module.exports = new AuditLogRepository();
