/**
 * ============================================================
 * BaseRepository (Generic Data Access Layer)
 * ============================================================
 *
 * Purpose:
 * - Provides reusable database operations for any table
 * - Eliminates duplication of common CRUD logic
 * - Enables easy scaling when adding new tables
 *
 * Responsibilities:
 * ✅ Abstract SQL queries
 * ✅ Provide generic CRUD methods
 * ✅ Allow child repositories to extend functionality
 *
 * Usage:
 *   class TrainRepository extends BaseRepository {
 *     constructor() {
 *       super("trains");
 *     }
 *   }
 *
 * IMPORTANT:
 * - This layer ONLY handles database operations
 * - No business logic should exist here
 * ============================================================
 */

const db = require("../db.js");

class BaseRepository {
  /**
   * @param {string} table - Name of the database table
   */
  constructor(table) {
    this.table = table;
    this.db = db;
  }

  /**
   * ============================================================
   * Fetch all records from table
   * ============================================================
   *
   * Example:
   *   SELECT * FROM trains
   */
  findAll() {
    const stmt = this.db.prepare(`SELECT * FROM ${this.table}`);

    return stmt.all();
  }

  getColumns() {
    if (this._columns) {
      return this._columns;
    }

    const columns = this.db
      .prepare(`PRAGMA table_info(${this.table})`)
      .all()
      .map((column) => column.name);

    this._columns = columns;

    return columns;
  }

  findAllWithQuery(options = {}) {
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
        : "";

    const sql = `
      SELECT *
      FROM ${this.table}
      ${where.clause}
      ${orderClause}
      LIMIT ?
      OFFSET ?
    `;

    const rows = this.db.prepare(sql).all(...where.params, limit, offset);

    const countResult = this.db
      .prepare(`SELECT COUNT(*) AS total FROM ${this.table} ${where.clause}`)
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
   * ============================================================
   * Fetch a single record by ID
   * ============================================================
   *
   * Example:
   *   SELECT * FROM trains WHERE id = 1
   */
  findById(id) {
    const stmt = this.db.prepare(`SELECT * FROM ${this.table} WHERE id = ?`);

    return stmt.get(id);
  }

  /**
   * ============================================================
   * Delete a record by ID
   * ============================================================
   *
   * Example:
   *   DELETE FROM trains WHERE id = 1
   *
   * Returns:
   *   .run() result (includes number of rows affected)
   */
  deleteById(id) {
    const stmt = this.db.prepare(`DELETE FROM ${this.table} WHERE id = ?`);

    return stmt.run(id);
  }

  /**
   * ============================================================
   * Insert a new record
   * ============================================================
   *
   * Accepts:
   *   fields = { column: value }
   *
   * Example:
   *   insert({ name: "Train A", status: "On Time" })
   *
   * Builds dynamic SQL:
   *   INSERT INTO trains (name, status)
   *   VALUES (?, ?)
   */
  insert(fields) {
    /**
     * Extract column names and values
     */
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    /**
     * Generate placeholders:
     *   ["?", "?"] → "?, ?"
     */
    const placeholders = keys.map(() => "?").join(", ");

    /**
     * Prepare dynamic INSERT statement
     */
    const stmt = this.db.prepare(`
      INSERT INTO ${this.table} (${keys.join(", ")})
      VALUES (${placeholders})
    `);

    /**
     * Execute query with values
     */
    return stmt.run(...values);
  }

  /**
   * ============================================================
   * Update a record by ID
   * ============================================================
   *
   * Accepts:
   *   id = record identifier
   *   fields = { column: value }
   *
   * Example:
   *   updateById(1, { status: "Delayed" })
   *
   * Builds dynamic SQL:
   *   UPDATE trains
   *   SET status = ?
   *   WHERE id = 1
   */
  updateById(id, fields) {
    /**
     * Extract column names and values
     */
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    /**
     * Generate SET clause:
     *   ["status = ?", "name = ?"]
     */
    const setClause = keys.map((k) => `${k} = ?`).join(", ");

    /**
     * Prepare dynamic UPDATE statement
     */
    const stmt = this.db.prepare(`
      UPDATE ${this.table}
      SET ${setClause}
      WHERE id = ?
    `);

    /**
     * Execute query with values + id
     */
    return stmt.run(...values, id);
  }
}

module.exports = BaseRepository;
