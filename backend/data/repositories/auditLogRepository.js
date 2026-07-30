const BaseRepository = require("./baseRepository");

class AuditLogRepository extends BaseRepository {
  constructor() {
    super("audit_logs");
  }

  create(entry) {
    return this.insert(entry);
  }

  getRecent(limit = 100) {
    return this.db
      .prepare(
        `
      SELECT *
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ?
    `,
      )
      .all(limit);
  }
}

module.exports = new AuditLogRepository();
