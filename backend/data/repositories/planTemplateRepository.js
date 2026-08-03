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

  findAllWithQuery(options = {}) {
    const columns = this.getColumns();
    const filters = {};

    if (options.filters && typeof options.filters === "object") {
      Object.assign(filters, options.filters);
    }

    for (const [key, value] of Object.entries(options)) {
      if (
        [
          "q",
          "search",
          "sortBy",
          "sort",
          "order",
          "limit",
          "page",
          "offset",
          "filters",
        ].includes(key)
      ) {
        continue;
      }

      if (!columns.includes(key)) {
        continue;
      }

      filters[key] = value;
    }

    const search = options.search ?? options.q;
    const sortBy = (options.sortBy || options.sort || "").trim();
    const sortOrder = options.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    const limit = Math.max(1, Math.min(Number(options.limit) || 25, 200));
    const page = Math.max(1, Number(options.page) || 1);
    const offset =
      options.offset !== undefined
        ? Math.max(0, Number(options.offset) || 0)
        : (page - 1) * limit;

    const where = this._buildWhereClause(filters, search, columns);
    const allowedSortColumns = [...columns, "incident_type_name"];
    const orderClause =
      sortBy && allowedSortColumns.includes(sortBy)
        ? `ORDER BY ${sortBy} ${sortOrder}`
        : "ORDER BY it.name, pt.version DESC";

    const sql = `
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
      ${where.clause}
      ${orderClause}
      LIMIT ?
      OFFSET ?
    `;

    const rows = this.db.prepare(sql).all(...where.params, limit, offset);

    const countResult = this.db
      .prepare(
        `SELECT COUNT(*) AS total FROM plan_templates pt ${where.clause}`,
      )
      .get(...where.params);

    const total = countResult?.total || 0;

    return {
      rows,
      meta: {
        total,
        limit,
        offset,
        page,
        pageCount: Math.ceil(total / limit),
      },
    };
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
