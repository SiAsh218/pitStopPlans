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

  findByTemplateIdWithQuery(planTemplateId, options = {}) {
    const columns = this.getColumns();
    const filters = { plan_template_id: planTemplateId };

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
        : "ORDER BY stage_number";

    const sql = `
      SELECT *
      FROM plan_stages
      ${where.clause}
      ${orderClause}
      LIMIT ?
      OFFSET ?
    `;

    const rows = this.db.prepare(sql).all(...where.params, limit, offset);

    const countResult = this.db
      .prepare(`SELECT COUNT(*) AS total FROM plan_stages ${where.clause}`)
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
