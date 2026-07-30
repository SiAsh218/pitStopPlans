/**
 * ============================================================
 * UserRepository (Data Access Layer - Users)
 * ============================================================
 *
 * Purpose:
 * - Provides database access for the "users" table
 * - Extends BaseRepository for common CRUD operations
 * - Adds user-specific queries (e.g. findByEmail)
 *
 * Responsibilities:
 * ✅ Reuse generic CRUD logic from BaseRepository
 * ✅ Implement user-specific queries
 *
 * Architecture:
 * BaseRepository → shared DB logic
 * UserRepository → user-specific logic
 *
 * Used by:
 * - AuthService (for authentication)
 *
 * ============================================================
 */

const BaseRepository = require("./baseRepository");

class UserRepository extends BaseRepository {
  /**
   * Constructor
   *
   * Initialises repository with "users" table
   */
  constructor() {
    super("users");
  }

  /**
   * ============================================================
   * Find user by email
   * ============================================================
   *
   * @param {string} email
   * @returns {object|null}
   *
   * Purpose:
   * - Retrieve a user record by email address
   * - Used during login and registration
   *
   * Example:
   *   SELECT * FROM users WHERE email = ?
   *
   * Notes:
   * - Uses parameterized query (safe from SQL injection)
   * - Returns null if user not found
   */
  findByEmail(email) {
    return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }

  createUser(email, passwordHash, role) {
    const result = this.db
      .prepare(
        `
      INSERT INTO users
      (
        email,
        password,
        role
      )
      VALUES (?, ?, ?)
    `,
      )
      .run(email, passwordHash, role);

    return this.findById(result.lastInsertRowid);
  }

  updateUser(userId, updates) {
    const fields = [];
    const values = [];

    if (updates.role !== undefined) {
      fields.push("role = ?");
      values.push(updates.role);
    }

    if (updates.password !== undefined) {
      fields.push("password = ?");
      values.push(updates.password);
    }

    if (!fields.length) {
      return this.findById(userId);
    }

    values.push(userId);

    this.db
      .prepare(
        `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = ?
    `,
      )
      .run(...values);

    return this.findById(userId);
  }

  setActive(userId, active) {
    this.db
      .prepare(
        `
      UPDATE users
      SET active = ?
      WHERE id = ?
    `,
      )
      .run(active ? 1 : 0, userId);

    return this.findById(userId);
  }
}

module.exports = new UserRepository();
