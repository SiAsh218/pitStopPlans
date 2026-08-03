const BaseRepository = require("./baseRepository");

class PlanStageActionRepository extends BaseRepository {
  constructor() {
    super("plan_stage_actions");
  }

  /**
   * Default action ordering.
   *
   * @returns {string}
   */
  _defaultOrder() {
    return "ORDER BY action_number";
  }

  /**
   * Gets actions for a stage.
   *
   * @param {number} stageId
   * @returns {object[]}
   */
  findByStageId(stageId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_stage_actions
        WHERE plan_stage_id = ?
        ${this._defaultOrder()}
      `,
      )
      .all(stageId);
  }

  /**
   * Gets paginated actions for a stage.
   *
   * @param {number} stageId
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  findByStageIdWithQuery(stageId, options = {}) {
    const result = super.findAllWithQuery({
      ...options,
      plan_stage_id: stageId,
    });

    return {
      ...result,
      rows: result.rows.sort((a, b) => a.action_number - b.action_number),
    };
  }

  /**
   * Gets paginated actions with roles.
   *
   * @param {number} stageId
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
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

  /**
   * Finds an action by stage and action number.
   *
   * @param {number} stageId
   * @param {number} actionNumber
   * @returns {object|undefined}
   */
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

  /**
   * Gets roles assigned to an action.
   *
   * @param {number} actionId
   * @returns {object[]}
   */
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

  /**
   * Removes all role assignments.
   *
   * @param {number} actionId
   * @returns {object}
   */
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

  /**
   * Replaces role assignments.
   *
   * @param {number} actionId
   * @param {number[]} roleIds
   */
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

  /**
   * Gets an action with role assignments.
   *
   * @param {number} actionId
   * @returns {object|null}
   */
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

  /**
   * Gets all actions for a stage with roles.
   *
   * @param {number} stageId
   * @returns {object[]}
   */
  findByStageIdWithRoles(stageId) {
    const actions = this.findByStageId(stageId);

    return actions.map((action) => ({
      ...action,
      roles: this.getRoles(action.id),
    }));
  }

  /**
   * Clones an action and its role assignments.
   *
   * @param {number} actionId
   * @param {number} newStageId
   * @returns {object|null}
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
      roles.map((role) => role.id),
    );

    return this.getWithRoles(result.lastInsertRowid);
  }
}

module.exports = new PlanStageActionRepository();
