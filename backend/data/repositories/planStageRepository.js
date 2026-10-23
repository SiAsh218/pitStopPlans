const BaseRepository = require("./baseRepository");

class PlanStageRepository extends BaseRepository {
  constructor() {
    super("plan_stages");
  }

  /**
   * Default stage ordering.
   *
   * @returns {string}
   */
  _defaultOrder() {
    return "ORDER BY stage_number";
  }

  /**
   * Gets all stages for a template.
   *
   * @param {number} planTemplateId
   * @returns {object[]}
   */
  findByTemplateId(planTemplateId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_stages
        WHERE plan_template_id = ?
        ${this._defaultOrder()}
      `,
      )
      .all(planTemplateId);
  }

  /**
   * Gets paginated stages for a template.
   *
   * @param {number} planTemplateId
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  findByTemplateIdWithQuery(planTemplateId, options = {}) {
    const result = super.findAllWithQuery({
      ...options,
      plan_template_id: planTemplateId,
    });

    return {
      ...result,
      rows: result.rows.sort((a, b) => a.stage_number - b.stage_number),
    };
  }

  /**
   * Finds a stage by template and stage number.
   *
   * @param {number} planTemplateId
   * @param {number} stageNumber
   * @returns {object|undefined}
   */
  findByTemplateAndStageNumber(planTemplateId, stageNumber) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_stages
        WHERE plan_template_id = ?
          AND stage_number = ?
      `,
      )
      .get(planTemplateId, stageNumber);
  }

  reorderForTemplate(planTemplateId, stageIds) {
    const transaction = this.db.transaction(() => {
      const currentStages = this.findByTemplateId(planTemplateId);
      const offset =
        currentStages.reduce(
          (maximum, stage) => Math.max(maximum, stage.stage_number),
          0,
        ) +
        currentStages.length +
        1;

      this.db
        .prepare(
          `
          UPDATE plan_stages
          SET stage_number = stage_number + ?
          WHERE plan_template_id = ?
        `,
        )
        .run(offset, planTemplateId);

      const updateStageNumber = this.db.prepare(`
        UPDATE plan_stages
        SET stage_number = ?
        WHERE id = ? AND plan_template_id = ?
      `);

      stageIds.forEach((stageId, index) => {
        updateStageNumber.run(index + 1, stageId, planTemplateId);
      });
    });

    transaction();
  }

  /**
   * Clones a stage into another template.
   *
   * @param {number} stageId
   * @param {number} targetTemplateId
   * @returns {object|null}
   */
  cloneStage(stageId, targetTemplateId) {
    const stage = this.findById(stageId);

    if (!stage) {
      return null;
    }

    const result = this.insert({
      plan_template_id: targetTemplateId,
      stage_number: stage.stage_number,
      name: stage.name,
      due_from_incident_start: stage.due_from_incident_start,
    });

    return this.findById(result.lastInsertRowid);
  }
}

module.exports = new PlanStageRepository();
