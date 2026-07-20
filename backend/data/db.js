/**
 * ============================================================
 * Database Connection (SQLite)
 * ============================================================
 *
 * Purpose:
 * - Establishes a connection to the SQLite database
 * - Provides a shared database instance across the application
 *
 * Responsibilities:
 * ✅ Create/open database file
 * ✅ Configure database settings (PRAGMA)
 * ✅ Export a single shared DB instance
 *
 * IMPORTANT:
 * - Uses better-sqlite3 (synchronous SQLite client)
 * - All repositories use this shared instance
 *
 * ============================================================
 */

const Database = require("better-sqlite3");
const path = require("path");

/**
 * ============================================================
 * Database file path
 * ============================================================
 *
 * Resolves the database file location relative to this directory
 */
const dbPath = path.join(__dirname, "database.sqlite");

/**
 * ============================================================
 * Create database instance
 * ============================================================
 *
 * Behaviour:
 * - If file exists → opens existing DB
 * - If file does not exist → creates new DB file
 */
const db = new Database(dbPath);

/**
 * ============================================================
 * Enable Foreign Key Constraints
 * ============================================================
 *
 * SQLite does NOT enforce foreign keys by default.
 *
 * This ensures:
 * ✅ Referential integrity
 * ✅ Prevents invalid relationships between tables
 *
 * Example:
 * - Cannot insert a child record that references a non-existent parent
 */
db.pragma("foreign_keys = ON");

/**
 * ============================================================
 * Export shared database instance
 * ============================================================
 *
 * This ensures:
 * ✅ Single connection across application
 * ✅ Consistent DB usage in all repositories
 */
module.exports = db;
