const BaseRepository = require("./baseRepository");

class IncidentActionUpdateRepository extends BaseRepository {
  constructor() {
    super("incident_action_updates");
  }

  /**
   * Common projection.
   *
   * @returns {string}
   */
  _projection() {
    return `
      iau.*,
      u.id AS user_id,
      u.email AS user_email
    `;
  }

  /**
   * Gets all updates for an incident action.
   *
   * @param {number} incidentActionId
   * @returns {object[]}
   */
  findByIncidentActionId(incidentActionId) {
    return this.db
      .prepare(
        `
        SELECT
          ${this._projection()}
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
   * Gets paginated updates for an incident action.
   *
   * @param {number} incidentActionId
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  findByIncidentActionIdWithQuery(incidentActionId, options = {}) {
    const columns = this.getColumns();
    const filters = {
      incident_action_id: incidentActionId,
    };

    if (options.filters && typeof options.filters === "object") {
      Object.assign(filters, options.filters);
    }

    const reservedKeys = new Set([
      "filters",
      "search",
      "q",
      "sortBy",
      "sort",
      "order",
      "limit",
      "page",
      "offset",
    ]);

    for (const [key, value] of Object.entries(options)) {
      if (reservedKeys.has(key)) {
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

    const orderClause =
      sortBy && columns.includes(sortBy)
        ? `ORDER BY ${sortBy} ${sortOrder}`
        : "ORDER BY iau.created_at DESC";

    const sql = `
      SELECT
        ${this._projection()}
      FROM incident_action_updates iau
      INNER JOIN users u
        ON iau.user_id = u.id
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
        FROM incident_action_updates iau
        INNER JOIN users u
          ON iau.user_id = u.id
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
   * Gets a single update with user details.
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
