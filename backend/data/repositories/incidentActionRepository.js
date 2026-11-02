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

  findByIncidentIdWithRolesQuery(incidentId, options = {}, userId) {
    const result = this.findByIncidentIdWithQuery(incidentId, options);

    return {
      rows: this._attachRoles(result.rows, userId),
      meta: result.meta,
    };
  }

  _attachRoles(actions, userId) {
    if (!actions.length) {
      return [];
    }

    const actionIds = actions.map((action) => action.id);
    const roleRows = this.getRolesForActions(actionIds);
    const textUpdateRows = this.db
      .prepare(
        `
        SELECT DISTINCT incident_action_id
        FROM incident_action_updates
        WHERE update_type = 'comment'
          AND TRIM(COALESCE(note, '')) != ''
          AND incident_action_id IN (${actionIds.map(() => "?").join(", ")})
      `,
      )
      .all(...actionIds);

    const roleMap = new Map();
    const textUpdateActionIds = new Set(
      textUpdateRows.map((row) => row.incident_action_id),
    );
    const unseenTextUpdateActionIds = new Set();

    if (userId != null) {
      const unseenTextUpdateRows = this.db
        .prepare(
          `
          SELECT DISTINCT iau.incident_action_id
          FROM incident_action_updates iau
          LEFT JOIN incident_action_update_reads iaur
            ON iaur.update_id = iau.id
            AND iaur.user_id = ?
            AND iaur.incident_action_id = iau.incident_action_id
          WHERE iau.update_type = 'comment'
            AND TRIM(COALESCE(iau.note, '')) != ''
            AND iau.user_id != ?
            AND iaur.update_id IS NULL
            AND iau.incident_action_id IN (${actionIds.map(() => "?").join(", ")})
        `,
        )
        .all(userId, userId, ...actionIds);

      for (const row of unseenTextUpdateRows) {
        unseenTextUpdateActionIds.add(row.incident_action_id);
      }
    }

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
      has_text_update: textUpdateActionIds.has(action.id),
      has_unseen_text_update: unseenTextUpdateActionIds.has(action.id),
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

  findByIncidentIdWithRoles(incidentId, userId) {
    const actions = this.findByIncidentId(incidentId);

    return this._attachRoles(actions, userId);
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
