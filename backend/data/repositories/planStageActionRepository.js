const BaseRepository = require("./baseRepository");

class PlanStageActionRepository extends BaseRepository {
  constructor() {
    super("plan_stage_actions");
  }

  findByStageId(stageId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_stage_actions
        WHERE plan_stage_id = ?
        ORDER BY action_number
      `,
      )
      .all(stageId);
  }

  findByStageIdWithQuery(stageId, options = {}) {
    const columns = this.getColumns();
    const filters = { plan_stage_id: stageId };

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
        : "ORDER BY action_number";

    const sql = `
      SELECT *
      FROM plan_stage_actions
      ${where.clause}
      ${orderClause}
      LIMIT ?
      OFFSET ?
    `;

    const rows = this.db.prepare(sql).all(...where.params, limit, offset);

    const countResult = this.db
      .prepare(
        `SELECT COUNT(*) AS total FROM plan_stage_actions ${where.clause}`,
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

  findByStageIdWithRolesQuery(stageId, options = {}) {
    const result = this.findByStageIdWithQuery(stageId, options);

    return {
      rows: result.rows.map((action) => ({
        ...action,
        roles: this.getRoles(action.id),
      })),
      meta: result.meta,
    };
  }

  findByStageAndActionNumber(stageId, actionNumber) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_stage_actions
        WHERE plan_stage_id = ?
          AND action_number = ?
      `,
      )
      .get(stageId, actionNumber);
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
        WHERE psar.plan_stage_action_id = ?
        ORDER BY r.name
      `,
      )
      .all(actionId);
  }

  clearRoles(actionId) {
    return this.db
      .prepare(
        `
        DELETE
        FROM plan_stage_action_roles
        WHERE plan_stage_action_id = ?
      `,
      )
      .run(actionId);
  }

  setRoles(actionId, roleIds = []) {
    const transaction = this.db.transaction(() => {
      this.clearRoles(actionId);

      const stmt = this.db.prepare(`
            INSERT INTO plan_stage_action_roles
            (
              plan_stage_action_id,
              role_id
            )
            VALUES (?, ?)
          `);

      for (const roleId of roleIds) {
        stmt.run(actionId, roleId);
      }
    });

    transaction();
  }

  getWithRoles(actionId) {
    const action = this.findById(actionId);

    if (!action) {
      return null;
    }

    return {
      ...action,
      roles: this.getRoles(actionId),
    };
  }

  findByStageIdWithRoles(stageId) {
    const actions = this.findByStageId(stageId);

    return actions.map((action) => ({
      ...action,
      roles: this.getRoles(action.id),
    }));
  }

  /**
   * ============================================================
   * Clone Action
   * ============================================================
   *
   * Creates a copy of an existing action
   * under a new stage and copies role
   * assignments.
   */
  cloneAction(actionId, newStageId) {
    const action = this.findById(actionId);

    if (!action) {
      return null;
    }

    const result = this.insert({
      plan_stage_id: newStageId,
      action_number: action.action_number,
      title: action.title,
      description: action.description,
      due_from_stage_start: action.due_from_stage_start,
      due_from_incident_start: action.due_from_incident_start,
    });

    const roles = this.getRoles(actionId);

    this.setRoles(
      result.lastInsertRowid,
      roles.map((r) => r.id),
    );

    return this.getWithRoles(result.lastInsertRowid);
  }
}

module.exports = new PlanStageActionRepository();
