const BaseRepository = require("./baseRepository");

class PlanStageRepository extends BaseRepository {
  constructor() {
    super("plan_stages");
  }

  /**
   * ============================================================
   * Get all stages for a template
   * ============================================================
   */
  findByTemplateId(planTemplateId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM plan_stages
        WHERE plan_template_id = ?
        ORDER BY stage_number
      `,
      )
      .all(planTemplateId);
  }

  /**
   * ============================================================
   * Find stage by template + stage number
   * ============================================================
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

  /**
   * ============================================================
   * Clone Stage
   * ============================================================
   *
   * Creates a copy of an existing stage
   * under a new template.
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
