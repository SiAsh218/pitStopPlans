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

  /**
   * ============================================================
   * Future Extension Point
   * ============================================================
   *
   * You can add user-specific queries here, for example:
   *
   * findByRole(role) {
   *   return this.findWhere({ role });
   * }
   *
   * getAdmins() {
   *   return this.findWhere({ role: "admin" });
   * }
   */
}

module.exports = new UserRepository();
