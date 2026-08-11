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
      rows: result.rows.map((action) => ({
        ...action,
        roles: this.getRoles(action.id),
      })),
      meta: result.meta,
    };
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

    return actions.map((action) => ({
      ...action,
      roles: this.getRoles(action.id),
    }));
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
}

module.exports = new IncidentActionRepository();
