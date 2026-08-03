const BaseRepository = require("./baseRepository");

class IncidentActionRepository extends BaseRepository {
  constructor() {
    super("incident_actions");
  }

  /**
   * ============================================================
   * Get all actions for an incident
   * ============================================================
   */
  findByIncidentId(incidentId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE incident_id = ?
        ORDER BY
          stage_number,
          action_number
      `,
      )
      .all(incidentId);
  }

  findByIncidentIdWithQuery(incidentId, options = {}) {
    const columns = this.getColumns();
    const filters = { incident_id: incidentId };

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
        : "ORDER BY stage_number, action_number";

    const sql = `
      SELECT *
      FROM incident_actions
      ${where.clause}
      ${orderClause}
      LIMIT ?
      OFFSET ?
    `;

    const rows = this.db.prepare(sql).all(...where.params, limit, offset);

    const countResult = this.db
      .prepare(`SELECT COUNT(*) AS total FROM incident_actions ${where.clause}`)
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

  findByIncidentIdWithRolesQuery(incidentId, options = {}) {
    const result = this.findByIncidentIdWithQuery(incidentId, options);

    return {
      rows: result.rows.map((action) => ({
        ...action,
        roles: this.getRoles(action.id),
      })),
      meta: result.meta,
    };
  }

  /**
   * ============================================================
   * Get single action
   * ============================================================
   */
  findByIdWithDetails(id) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE id = ?
      `,
      )
      .get(id);
  }

  /**
   * ============================================================
   * Get actions by status
   * ============================================================
   */
  findByIncidentAndStatus(incidentId, status) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE incident_id = ?
          AND status = ?
        ORDER BY
          stage_number,
          action_number
      `,
      )
      .all(incidentId, status);
  }

  /**
   * ============================================================
   * Get incomplete actions
   * ============================================================
   */
  findOutstandingByIncidentId(incidentId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE incident_id = ?
          AND status != 'completed'
        ORDER BY
          stage_number,
          action_number
      `,
      )
      .all(incidentId);
  }

  /**
   * ============================================================
   * Get completed actions
   * ============================================================
   */
  findCompletedByIncidentId(incidentId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE incident_id = ?
          AND status = 'completed'
        ORDER BY
          stage_number,
          action_number
      `,
      )
      .all(incidentId);
  }

  /**
   * ============================================================
   * Get actions assigned to a user
   * ============================================================
   */
  findAssignedToUser(userId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE assigned_user_id = ?
        ORDER BY
          stage_number,
          action_number
      `,
      )
      .all(userId);
  }

  findOverdue() {
    return this.db
      .prepare(
        `
      SELECT *
      FROM incident_actions
      WHERE status != 'completed'
    `,
      )
      .all();
  }

  getRoles(actionId) {
    return this.db
      .prepare(
        `
      SELECT
        r.id,
        r.name
      FROM roles r
      INNER JOIN plan_stage_action_roles psar
        ON r.id = psar.role_id
      INNER JOIN incident_actions ia
        ON ia.original_action_id =
           psar.plan_stage_action_id
      WHERE ia.id = ?
      ORDER BY r.name
    `,
      )
      .all(actionId);
  }

  findByIncidentIdWithRoles(incidentId) {
    const actions = this.findByIncidentId(incidentId);

    return actions.map((action) => ({
      ...action,
      roles: this.getRoles(action.id),
    }));
  }
}

module.exports = new IncidentActionRepository();
