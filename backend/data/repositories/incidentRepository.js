const BaseRepository = require("./baseRepository");

class IncidentRepository extends BaseRepository {
  constructor() {
    super("incidents");
  }

  /**
   * Common incident projection.
   *
   * @returns {string}
   */
  _projection() {
    return `
      i.*,
      it.name AS incident_type_name,
      u.email AS created_by_email
    `;
  }

  /**
   * Builds the incident-specific WHERE clause.
   *
   * Incident queries join multiple tables, so columns from the
   * incidents table must be qualified with the `i` alias.
   *
   * @param {object} filters
   * @param {string} search
   * @param {string[]} columns
   * @returns {{clause: string, params: any[]}}
   */
  _buildWhereClause(filters, search, columns) {
    const clauses = [];
    const params = [];

    for (const [column, value] of Object.entries(filters)) {
      if (!columns.includes(column)) {
        continue;
      }

      const qualifiedColumn = `i.${column}`;

      if (value === null || value === "null") {
        clauses.push(`${qualifiedColumn} IS NULL`);
        continue;
      }

      if (typeof value === "string" && value.includes("%")) {
        clauses.push(`${qualifiedColumn} LIKE ?`);
        params.push(value);
        continue;
      }

      if (value === "true" || value === "false") {
        clauses.push(`${qualifiedColumn} = ?`);
        params.push(value === "true" ? 1 : 0);
        continue;
      }

      clauses.push(`${qualifiedColumn} = ?`);
      params.push(value);
    }

    if (search) {
      const searchColumns = [
        ...columns.map((column) => `i.${column}`),
        "it.name",
        "u.email",
      ];

      clauses.push(
        `(${searchColumns.map((column) => `${column} LIKE ?`).join(" OR ")})`,
      );

      for (const column of searchColumns) {
        params.push(`%${search}%`);
      }
    }

    return {
      clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
      params,
    };
  }

  /**
   * Finds an incident by ID with related details.
   *
   * @param {number} id
   * @returns {object|undefined}
   */
  findByIdWithDetails(id) {
    return this.db
      .prepare(
        `
        SELECT
          ${this._projection()}
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

  /**
   * Returns all incidents with related details.
   *
   * @returns {object[]}
   */
  findAllWithDetails() {
    return this.db
      .prepare(
        `
        SELECT
          ${this._projection()}
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

  /**
   * Returns paginated incidents with filtering,
   * searching and sorting support.
   *
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  findAllWithDetailsQuery(options = {}) {
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

    const allowedSortColumns = [
      ...columns,
      "incident_type_name",
      "created_by_email",
    ];

    let orderClause = "ORDER BY i.started_at DESC";

    if (sortBy && allowedSortColumns.includes(sortBy)) {
      const qualifiedSortColumn = columns.includes(sortBy)
        ? `i.${sortBy}`
        : sortBy === "incident_type_name"
          ? "it.name"
          : sortBy === "created_by_email"
            ? "u.email"
            : null;

      if (qualifiedSortColumn) {
        orderClause = `ORDER BY ${qualifiedSortColumn} ${sortOrder}`;
      }
    }

    const sql = `
      SELECT
        ${this._projection()}
      FROM incidents i
      INNER JOIN incident_types it
        ON i.incident_type_id = it.id
      INNER JOIN users u
        ON i.created_by = u.id
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
        FROM incidents i
        INNER JOIN incident_types it
          ON i.incident_type_id = it.id
        INNER JOIN users u
          ON i.created_by = u.id
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
   * Creates an incident.
   *
   * @param {object} data
   * @returns {object}
   */
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
          ccil_number,
          tin_number,
          status,
          created_by,
          incident_manager_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        data.incident_type_id,
        data.plan_template_id,
        data.template_version,
        data.title,
        data.description,
        data.ccil_number,
        data.tin_number,
        data.status,
        data.created_by,
        data.incident_manager_id,
      );
  }

  /**
   * Finds incidents by status.
   *
   * @param {string} status
   * @returns {object[]}
   */
  findByStatus(status) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incidents
        WHERE status = ?
        ORDER BY started_at DESC
      `,
      )
      .all(status);
  }

  /**
   * Returns active incidents.
   *
   * @returns {object[]}
   */
  findOpen() {
    return this.findByStatus("active");
  }

  /**
   * Returns closed incidents.
   *
   * @returns {object[]}
   */
  findClosed() {
    return this.findByStatus("closed");
  }
}

module.exports = new IncidentRepository();
