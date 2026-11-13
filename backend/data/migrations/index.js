const migrateLegacySchema = require("./001_legacySchema");
const ensureIncidentActionUpdateReadsTable = require("./incidentActionUpdateReads");

const MIGRATIONS = [
  {
    version: 1,
    name: "legacy-schema",
    up: migrateLegacySchema,
  },
  {
    version: 2,
    name: "incident-action-update-reads",
    up: ensureIncidentActionUpdateReadsTable,
  },
];

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const getAppliedMigration = db.prepare(
    "SELECT 1 FROM schema_migrations WHERE version = ?",
  );
  const recordMigration = db.prepare(
    "INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
  );

  for (const migration of MIGRATIONS) {
    if (getAppliedMigration.get(migration.version)) {
      continue;
    }

    migration.up(db);
    recordMigration.run(migration.version, migration.name);
  }
}

module.exports = runMigrations;
