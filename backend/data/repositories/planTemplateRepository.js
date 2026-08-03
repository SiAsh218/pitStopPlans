const BaseRepository = require("./baseRepository");

class PlanTemplateRepository extends BaseRepository {
  constructor() {
    super("plan_templates");
  }

  /**
   * Common template projection with incident type details.
   *
   * @returns {string}
   */
  _templateProjection() {
    return `
      pt.id,
      pt.version,
      pt.title,
      pt.status,
      pt.created_at,
      pt.approved_at,
      pt.incident_type_id,
      it.name AS incident_type_name
    `;
  }

  /**
   * Latest approved version for an incident type.
   *
   * @param {number} incidentTypeId
   * @returns {object|undefined}
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
   * Latest version regardless of status.
   *
   * @param {number} incidentTypeId
   * @returns {object|undefined}
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
   * Finds a template by incident type and version.
   *
   * @param {number} incidentTypeId
   * @param {number} version
   * @returns {object|undefined}
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
   * Finds templates by incident type and status.
   *
   * @param {number} incidentTypeId
   * @param {string} status
   * @returns {object[]}
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
   * Finds templates by status.
   *
   * @param {string} status
   * @returns {object[]}
   */
  findByStatus(status) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_templates
        WHERE status = ?
        ORDER BY created_at DESC
      `,
      )
      .all(status);
  }

  /**
   * Returns all draft templates.
   *
   * @returns {object[]}
   */
  findDrafts() {
    return this.findByStatus("draft");
  }

  /**
   * Returns all approved templates.
   *
   * @returns {object[]}
   */
  findApproved() {
    return this.findByStatus("approved");
  }

  /**
   * Returns all templates with incident type details.
   *
   * @returns {object[]}
   */
  findAllWithIncidentType() {
    return this.db
      .prepare(
        `
        SELECT
          ${this._templateProjection()}
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
   * Returns paginated templates with filtering, searching and sorting.
   *
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
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
        ${this._templateProjection()}
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
        `
        SELECT COUNT(*) AS total
        FROM plan_templates pt
        INNER JOIN incident_types it
          ON pt.incident_type_id = it.id
        ${where.clause}
      `,
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
   * Finds a template by ID including incident type details.
   *
   * @param {number} id
   * @returns {object|undefined}
   */
  findByIdWithIncidentType(id) {
    return this.db
      .prepare(
        `
        SELECT
          ${this._templateProjection()}
        FROM plan_templates pt
        INNER JOIN incident_types it
          ON pt.incident_type_id = it.id
        WHERE pt.id = ?
      `,
      )
      .get(id);
  }

  /**
   * Returns all versions of an incident type.
   *
   * @param {number} incidentTypeId
   * @returns {object[]}
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
   * Returns the latest non-retired template
   * for each incident type.
   *
   * @returns {object[]}
   */
  findLatestWithIncidentType() {
    return this.db
      .prepare(
        `
        SELECT
          ${this._templateProjection()}
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
