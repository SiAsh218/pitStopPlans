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
