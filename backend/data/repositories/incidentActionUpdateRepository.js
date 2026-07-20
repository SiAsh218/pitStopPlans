const BaseRepository = require("./baseRepository");

class IncidentActionUpdateRepository extends BaseRepository {
  constructor() {
    super("incident_action_updates");
  }

  /**
   * ============================================================
   * Get all updates for an incident action
   * ============================================================
   */
  findByIncidentActionId(incidentActionId) {
    return this.db
      .prepare(
        `
        SELECT
          iau.*,
          u.id AS user_id,
          u.email AS user_email
        FROM incident_action_updates iau
        INNER JOIN users u
          ON iau.user_id = u.id
        WHERE iau.incident_action_id = ?
        ORDER BY iau.created_at DESC
      `,
      )
      .all(incidentActionId);
  }

  /**
   * ============================================================
   * Get single update with user details
   * ============================================================
   */
  findByIdWithDetails(id) {
    return this.db
      .prepare(
        `
        SELECT
          iau.*,
          u.id AS user_id,
          u.email AS user_email
        FROM incident_action_updates iau
        INNER JOIN users u
          ON iau.user_id = u.id
        WHERE iau.id = ?
      `,
      )
      .get(id);
  }
}

module.exports = new IncidentActionUpdateRepository();
