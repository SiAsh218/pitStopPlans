const BaseRepository = require("./baseRepository");

class IncidentActionRepository extends BaseRepository {
  constructor() {
    super("incident_actions");
  }

  _defaultOrder() {
    return `
      ORDER BY
        stage_number,
        action_number
    `;
  }

  findByIncidentId(incidentId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE incident_id = ?
        ${this._defaultOrder()}
      `,
      )
      .all(incidentId);
  }

  findByIdWithDetails(id) {
    return this.findById(id);
  }

  findAllWithQuery(options = {}) {
    const result = super.findAllWithQuery(options);

    return {
      ...result,
      rows: result.rows.sort((a, b) =>
        a.stage_number === b.stage_number
          ? a.action_number - b.action_number
          : a.stage_number - b.stage_number,
      ),
    };
  }

  findByIncidentIdWithQuery(incidentId, options = {}) {
    const result = super.findAllWithQuery({
      ...options,
      incident_id: incidentId,
    });

    return {
      ...result,
      rows: result.rows.sort((a, b) =>
        a.stage_number === b.stage_number
          ? a.action_number - b.action_number
          : a.stage_number - b.stage_number,
      ),
    };
  }
  findByIncidentIdWithRolesQuery(incidentId, options = {}) {
    const result = this.findByIncidentIdWithQuery(incidentId, options);

    return {
      rows: this._attachRoles(result.rows),
      meta: result.meta,
    };
  }

  _attachRoles(actions) {
    if (!actions.length) {
      return [];
    }

    const roleRows = this.getRolesForActions(
      actions.map((action) => action.id),
    );

    const roleMap = new Map();

    for (const row of roleRows) {
      if (!roleMap.has(row.action_id)) {
        roleMap.set(row.action_id, []);
      }

      roleMap.get(row.action_id).push({
        id: row.id,
        name: row.name,
      });
    }

    return actions.map((action) => ({
      ...action,
      roles: roleMap.get(action.id) || [],
    }));
  }

  findByIncidentAndStatus(incidentId, status) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE incident_id = ?
          AND status = ?
        ${this._defaultOrder()}
      `,
      )
      .all(incidentId, status);
  }

  findOutstandingByIncidentId(incidentId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE incident_id = ?
          AND status != 'completed'
        ${this._defaultOrder()}
      `,
      )
      .all(incidentId);
  }

  findCompletedByIncidentId(incidentId) {
    return this.findByIncidentAndStatus(incidentId, "completed");
  }

  findAssignedToUser(userId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_actions
        WHERE assigned_user_id = ?
        ${this._defaultOrder()}
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

    return this._attachRoles(actions);
  }

  findAllActionRoles() {
    return this.db
      .prepare(
        `
    SELECT
      ia.id AS action_id,
      ia.incident_id,
      r.id AS role_id,
      r.name AS role_name
    FROM incident_actions ia
    INNER JOIN plan_stage_action_roles psar
      ON ia.original_action_id =
         psar.plan_stage_action_id
    INNER JOIN roles r
      ON r.id = psar.role_id
    ORDER BY ia.id
  `,
      )
      .all();
  }

  findAllActionRolesWithQuery(options = {}) {
    const filters = [];
    const params = [];

    if (options.action_id) {
      filters.push("ia.id = ?");
      params.push(options.action_id);
    }

    if (options.incident_id) {
      filters.push("ia.incident_id = ?");
      params.push(options.incident_id);
    }

    if (options.role_id) {
      filters.push("r.id = ?");
      params.push(options.role_id);
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
    const limit = Math.max(1, Math.min(Number(options.limit) || 1000, 10000));
    const page = Math.max(1, Number(options.page) || 1);
    const offset = (page - 1) * limit;

    const rows = this.db
      .prepare(
        `
      SELECT
        ia.id AS action_id,
        ia.incident_id,
        r.id AS role_id,
        r.name AS role_name
      FROM incident_actions ia
      INNER JOIN plan_stage_action_roles psar
        ON ia.original_action_id =
           psar.plan_stage_action_id
      INNER JOIN roles r
        ON r.id = psar.role_id
      ${whereClause}
      ORDER BY ia.id
      LIMIT ?
      OFFSET ?
    `,
      )
      .all(...params, limit, offset);

    const total = this.db
      .prepare(
        `
      SELECT COUNT(*) AS total
      FROM incident_actions ia
      INNER JOIN plan_stage_action_roles psar
        ON ia.original_action_id =
           psar.plan_stage_action_id
      INNER JOIN roles r
        ON r.id = psar.role_id
      ${whereClause}
    `,
      )
      .get(...params).total;

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

  getRolesForActions(actionIds) {
    if (!actionIds.length) {
      return [];
    }

    const placeholders = actionIds.map(() => "?").join(",");

    return this.db
      .prepare(
        `
      SELECT
        ia.id AS action_id,
        r.id,
        r.name
      FROM incident_actions ia
      INNER JOIN plan_stage_action_roles psar
        ON ia.original_action_id =
           psar.plan_stage_action_id
      INNER JOIN roles r
        ON r.id = psar.role_id
      WHERE ia.id IN (${placeholders})
      ORDER BY r.name
    `,
      )
      .all(...actionIds);
  }
}

module.exports = new IncidentActionRepository();
