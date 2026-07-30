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
      SELECT
        audit_logs.*,
        actor.email AS actor_email,
        target.email AS target_email
      FROM audit_logs
      LEFT JOIN users actor
        ON actor.id = audit_logs.user_id
      LEFT JOIN users target
        ON target.id = audit_logs.entity_id
      ORDER BY audit_logs.created_at DESC
      LIMIT ?
    `,
      )
      .all(limit);
  }
}

module.exports = new AuditLogRepository();
