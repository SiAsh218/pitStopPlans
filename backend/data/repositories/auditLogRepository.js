const BaseRepository = require("./baseRepository");

class AuditLogRepository extends BaseRepository {
  constructor() {
    super("audit_logs");
  }

  create(entry) {
    return this.insert(entry);
  }

  findRecentWithQuery(options = {}) {
    const columns = this.getColumns();
    const filters = {};

    if (options.filters && typeof options.filters === "object") {
      Object.assign(filters, options.filters);
    }

    for (const [key, value] of Object.entries(options)) {
      if (
        [
          "q",
          "search",
          "sortBy",
          "sort",
          "order",
          "limit",
          "page",
          "offset",
          "filters",
        ].includes(key)
      ) {
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
    const allowedSortColumns = [...columns, "actor_email", "target_email"];
    const orderClause =
      sortBy && allowedSortColumns.includes(sortBy)
        ? `ORDER BY ${sortBy} ${sortOrder}`
        : "ORDER BY audit_logs.created_at DESC";

    const sql = `
      SELECT
        audit_logs.*,
        actor.email AS actor_email,
        target.email AS target_email,
        template.title AS target_title
      FROM audit_logs
      LEFT JOIN users actor
        ON actor.id = audit_logs.user_id
      LEFT JOIN users target
        ON target.id = audit_logs.entity_id
        AND audit_logs.entity_type = 'user'
      LEFT JOIN plan_templates template
        ON template.id = audit_logs.entity_id
        AND audit_logs.entity_type = 'plan_template'
      ${where.clause}
      ${orderClause}
      LIMIT ?
      OFFSET ?
    `;

    const rows = this.db.prepare(sql).all(...where.params, limit, offset);

    const countResult = this.db
      .prepare(`SELECT COUNT(*) AS total FROM audit_logs ${where.clause}`)
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

  getRecent(limit = 100) {
    return this.findRecentWithQuery({ limit });
  }
}

module.exports = new AuditLogRepository();
