const db = require("../db");

class BaseRepository {
  /**
   * @param {string} table
   */
  constructor(table) {
    this.table = table;
    this.db = db;
    this._columns = null;
  }

  /**
   * Returns table columns.
   *
   * @returns {string[]}
   */
  getColumns() {
    if (this._columns) {
      return this._columns;
    }

    this._columns = this.db
      .prepare(`PRAGMA table_info(${this.table})`)
      .all()
      .map((column) => column.name);

    return this._columns;
  }

  /**
   * Returns all rows.
   *
   * @returns {object[]}
   */
  findAll() {
    return this.db.prepare(`SELECT * FROM ${this.table}`).all();
  }

  /**
   * Normalises query options.
   *
   * @param {object} options
   * @returns {object}
   */
  _normaliseQueryOptions(options = {}) {
    const columns = this.getColumns();

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

    const filters = {};

    if (options.filters && typeof options.filters === "object") {
      Object.assign(filters, options.filters);
    }

    for (const [key, value] of Object.entries(options)) {
      if (reservedKeys.has(key)) {
        continue;
      }

      if (!columns.includes(key)) {
        continue;
      }

      filters[key] = value;
    }

    return {
      columns,
      filters,
      search: options.search ?? options.q,
      sortBy: (options.sortBy || options.sort || "").trim(),
      sortOrder: options.order?.toUpperCase() === "DESC" ? "DESC" : "ASC",
      limit: Math.max(1, Math.min(Number(options.limit) || 25, 200)),
      page: Math.max(1, Number(options.page) || 1),
      offset:
        options.offset !== undefined
          ? Math.max(0, Number(options.offset) || 0)
          : (Math.max(1, Number(options.page) || 1) - 1) *
            Math.max(1, Math.min(Number(options.limit) || 25, 200)),
    };
  }

  /**
   * Generic paged query.
   *
   * @param {object} options
   * @returns {{rows: object[], meta: object}}
   */
  findAllWithQuery(options = {}) {
    const query = this._normaliseQueryOptions(options);

    const where = this._buildWhereClause(
      query.filters,
      query.search,
      query.columns,
    );

    const orderClause =
      query.sortBy && query.columns.includes(query.sortBy)
        ? `ORDER BY ${query.sortBy} ${query.sortOrder}`
        : "";

    const sql = `
      SELECT *
      FROM ${this.table}
      ${where.clause}
      ${orderClause}
      LIMIT ?
      OFFSET ?
    `;

    const rows = this.db
      .prepare(sql)
      .all(...where.params, query.limit, query.offset);

    const countResult = this.db
      .prepare(
        `
        SELECT COUNT(*) AS total
        FROM ${this.table}
        ${where.clause}
      `,
      )
      .get(...where.params);

    const total = countResult?.total || 0;

    return {
      rows,
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
        page: query.page,
        pageCount: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * Builds WHERE clause.
   *
   * @param {object} filters
   * @param {string} search
   * @param {string[]} columns
   * @returns {{clause: string, params: any[]}}
   */
  _buildWhereClause(filters, search, columns) {
    const clauses = [];
    const params = [];

    for (const [column, value] of Object.entries(filters)) {
      if (!columns.includes(column)) {
        continue;
      }

      if (value === null || value === "null") {
        clauses.push(`${column} IS NULL`);
        continue;
      }

      if (typeof value === "string" && value.includes("%")) {
        clauses.push(`${column} LIKE ?`);
        params.push(value);
        continue;
      }

      if (value === "true" || value === "false") {
        clauses.push(`${column} = ?`);
        params.push(value === "true" ? 1 : 0);
        continue;
      }

      clauses.push(`${column} = ?`);
      params.push(value);
    }

    if (search) {
      const searchColumns = columns.map(
        (column) => `CAST(${column} AS TEXT) LIKE ?`,
      );

      if (searchColumns.length) {
        clauses.push(`(${searchColumns.join(" OR ")})`);

        for (let i = 0; i < searchColumns.length; i += 1) {
          params.push(`%${search}%`);
        }
      }
    }

    return {
      clause: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
      params,
    };
  }

  /**
   * Finds row by ID.
   *
   * @param {number} id
   * @returns {object|undefined}
   */
  findById(id) {
    return this.db.prepare(`SELECT * FROM ${this.table} WHERE id = ?`).get(id);
  }

  /**
   * Deletes row by ID.
   *
   * @param {number} id
   * @returns {object}
   */
  deleteById(id) {
    return this.db.prepare(`DELETE FROM ${this.table} WHERE id = ?`).run(id);
  }

  /**
   * Inserts a row.
   *
   * @param {object} fields
   * @returns {object}
   */
  insert(fields) {
    const keys = Object.keys(fields);

    if (!keys.length) {
      throw new Error("No fields supplied for insert");
    }

    const values = Object.values(fields);

    const placeholders = keys.map(() => "?").join(", ");

    return this.db
      .prepare(
        `
        INSERT INTO ${this.table}
        (${keys.join(", ")})
        VALUES (${placeholders})
      `,
      )
      .run(...values);
  }

  /**
   * Updates a row by ID.
   *
   * @param {number} id
   * @param {object} fields
   * @returns {object}
   */
  updateById(id, fields) {
    const keys = Object.keys(fields);

    if (!keys.length) {
      throw new Error("No fields supplied for update");
    }

    const values = Object.values(fields);

    const setClause = keys.map((key) => `${key} = ?`).join(", ");

    return this.db
      .prepare(
        `
        UPDATE ${this.table}
        SET ${setClause}
        WHERE id = ?
      `,
      )
      .run(...values, id);
  }
}

module.exports = BaseRepository;
