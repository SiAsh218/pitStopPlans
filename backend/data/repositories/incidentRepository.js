const BaseRepository = require("./baseRepository");

class IncidentRepository extends BaseRepository {
  constructor() {
    super("incidents");
  }

  findByIdWithDetails(id) {
    return this.db
      .prepare(
        `
        SELECT
          i.*,
          it.name AS incident_type_name,
          i.template_version,
          u.email AS created_by_email
        FROM incidents i
        INNER JOIN incident_types it
          ON i.incident_type_id = it.id
        INNER JOIN users u
          ON i.created_by = u.id
        WHERE i.id = ?
      `,
      )
      .get(id);
  }

  findAllWithDetails() {
    return this.db
      .prepare(
        `
        SELECT
          i.*,
          it.name AS incident_type_name,
          i.template_version,
          u.email AS created_by_email
        FROM incidents i
        INNER JOIN incident_types it
          ON i.incident_type_id = it.id
        INNER JOIN users u
          ON i.created_by = u.id
        ORDER BY i.started_at DESC
      `,
      )
      .all();
  }

  insertIncident(data) {
    return this.db
      .prepare(
        `
      INSERT INTO incidents
      (
        incident_type_id,
        plan_template_id,
        template_version,
        title,
        description,
        status,
        created_by,
        incident_manager_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        data.incident_type_id,
        data.plan_template_id,
        data.template_version,
        data.title,
        data.description,
        data.status,
        data.created_by,
        data.incident_manager_id,
      );
  }

  findOpen() {
    return this.db
      .prepare(
        `
      SELECT *
      FROM incidents
      WHERE status = 'active'
      ORDER BY started_at DESC
    `,
      )
      .all();
  }

  findClosed() {
    return this.db
      .prepare(
        `
      SELECT *
      FROM incidents
      WHERE status = 'closed'
      ORDER BY closed_at DESC
    `,
      )
      .all();
  }
}

module.exports = new IncidentRepository();
