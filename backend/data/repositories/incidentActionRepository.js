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
