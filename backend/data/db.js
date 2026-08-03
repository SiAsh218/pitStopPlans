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
 * ============================================================
 */

const Database = require("better-sqlite3");
const path = require("path");

/**
 * Absolute path to the SQLite database file.
 *
 * @type {string}
 */
const dbPath = path.join(__dirname, "database.sqlite");

/**
 * Shared SQLite database connection.
 *
 * If the database file exists it is opened.
 * If it does not exist it will be created automatically.
 *
 * @type {import("better-sqlite3").Database}
 */
const db = new Database(dbPath);

/**
 * Enable foreign key enforcement.
 *
 * SQLite does not enforce foreign keys by default.
 */
db.pragma("foreign_keys = ON");

module.exports = db;
