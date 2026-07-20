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
