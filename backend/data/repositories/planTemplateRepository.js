const BaseRepository = require("./baseRepository");

class PlanTemplateRepository extends BaseRepository {
  constructor() {
    super("plan_templates");
  }

  /**
   * ============================================================
   * Latest Approved Version
   * ============================================================
   *
   * Used when creating incidents.
   *
   * Returns latest APPROVED template only.
   */
  findLatestApprovedVersionByIncidentType(incidentTypeId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE incident_type_id = ?
          AND status = 'approved'
        ORDER BY version DESC
        LIMIT 1
      `,
      )
      .get(incidentTypeId);
  }

  /**
   * ============================================================
   * Latest Version (Any Status)
   * ============================================================
   *
   * Useful for template editing.
   */
  findLatestVersionByIncidentType(incidentTypeId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE incident_type_id = ?
        ORDER BY version DESC
        LIMIT 1
      `,
      )
      .get(incidentTypeId);
  }

  /**
   * ============================================================
   * Find By Incident Type + Version
   * ============================================================
   */
  findByIncidentTypeAndVersion(incidentTypeId, version) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE incident_type_id = ?
          AND version = ?
      `,
      )
      .get(incidentTypeId, version);
  }

  /**
   * ============================================================
   * Find By Incident Type + Status
   * ============================================================
   */
  findByIncidentTypeAndStatus(incidentTypeId, status) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE incident_type_id = ?
          AND status = ?
        ORDER BY version DESC
      `,
      )
      .all(incidentTypeId, status);
  }

  /**
   * ============================================================
   * All Templates With Incident Type
   * ============================================================
   */
  findAllWithIncidentType() {
    return this.db
      .prepare(
        `
        SELECT
          pt.id,
          pt.version,
          pt.title,
          pt.status,
          pt.created_at,
          pt.incident_type_id,

          it.name AS incident_type_name

        FROM plan_templates pt

        INNER JOIN incident_types it
          ON pt.incident_type_id = it.id

        ORDER BY
          it.name,
          pt.version DESC
      `,
      )
      .all();
  }

  /**
   * ============================================================
   * Template By ID
   * ============================================================
   */
  findByIdWithIncidentType(id) {
    return this.db
      .prepare(
        `
        SELECT
          pt.*,

          it.name AS incident_type_name

        FROM plan_templates pt

        INNER JOIN incident_types it
          ON pt.incident_type_id = it.id

        WHERE pt.id = ?
      `,
      )
      .get(id);
  }

  /**
   * ============================================================
   * Template History
   * ============================================================
   *
   * All versions for an incident type.
   */
  findByIncidentTypeId(incidentTypeId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE incident_type_id = ?
        ORDER BY version DESC
      `,
      )
      .all(incidentTypeId);
  }

  /**
   * ============================================================
   * Draft Templates
   * ============================================================
   */
  findDrafts() {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE status = 'draft'
        ORDER BY created_at DESC
      `,
      )
      .all();
  }

  /**
   * ============================================================
   * Approved Templates
   * ============================================================
   */
  findApproved() {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE status = 'approved'
        ORDER BY created_at DESC
      `,
      )
      .all();
  }

  /**
   * ============================================================
   * Latest Template Per Incident Type
   * ============================================================
   */
  findLatestWithIncidentType() {
    return this.db
      .prepare(
        `
      SELECT
        pt.id,
        pt.version,
        pt.title,
        pt.status,
        pt.created_at,
        pt.incident_type_id,

        it.name AS incident_type_name

      FROM plan_templates pt

      INNER JOIN incident_types it
        ON pt.incident_type_id = it.id

      WHERE pt.version = (
        SELECT MAX(version)
        FROM plan_templates p2
        WHERE p2.incident_type_id = pt.incident_type_id
      )

      AND pt.status != 'retired'

      ORDER BY it.name
    `,
      )
      .all();
  }
}

module.exports = new PlanTemplateRepository();
