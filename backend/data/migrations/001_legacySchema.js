function ensureColumn(db, tableName, columnName, alterStatement) {
  const columns = db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map((column) => column.name);

  if (!columns.includes(columnName)) {
    db.exec(alterStatement);
  }
}

function ensureAuditLogUserSetNull(db) {
  const columns = db.prepare("PRAGMA table_info(audit_logs)").all();
  const userIdColumn = columns.find((column) => column.name === "user_id");
  const userForeignKey = db
    .prepare("PRAGMA foreign_key_list(audit_logs)")
    .all()
    .find((foreignKey) => foreignKey.from === "user_id");

  if (
    userIdColumn &&
    !userIdColumn.notnull &&
    userForeignKey?.on_delete === "SET NULL"
  ) {
    return;
  }

  db.transaction(() => {
    db.exec(`
      CREATE TABLE audit_logs_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE SET NULL
      );

      INSERT INTO audit_logs_new (
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      )
      SELECT
        id,
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
      FROM audit_logs;

      DROP TABLE audit_logs;
      ALTER TABLE audit_logs_new RENAME TO audit_logs;
    `);
  })();
}

function ensurePlanTemplateUserSetNull(db) {
  const columns = db.prepare("PRAGMA table_info(plan_templates)").all();
  const foreignKeys = db.prepare("PRAGMA foreign_key_list(plan_templates)").all();
  const requiresMigration = ["created_by", "approved_by"].some((columnName) => {
    const column = columns.find((entry) => entry.name === columnName);
    const foreignKey = foreignKeys.find((entry) => entry.from === columnName);

    return (
      !column ||
      column.notnull ||
      foreignKey?.on_delete !== "SET NULL"
    );
  });

  if (!requiresMigration) {
    return;
  }

  const roleOrderValue = columns.some((column) => column.name === "role_order")
    ? "role_order"
    : "'[]'";
  const foreignKeysEnabled = db.pragma("foreign_keys", { simple: true });

  if (foreignKeysEnabled) {
    db.pragma("foreign_keys = OFF");
  }

  try {
    db.transaction(() => {
      db.exec(`
        CREATE TABLE plan_templates_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          incident_type_id INTEGER NOT NULL,
          version INTEGER NOT NULL,
          revision INTEGER NOT NULL DEFAULT 1,
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          role_order TEXT NOT NULL DEFAULT '[]',
          proposed_incident_type_name TEXT,
          proposed_incident_type_description TEXT,
          created_by INTEGER,
          approved_by INTEGER,
          approved_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (
            incident_type_id,
            version
          ),
          FOREIGN KEY (incident_type_id)
            REFERENCES incident_types(id),
          FOREIGN KEY (created_by)
            REFERENCES users(id)
            ON DELETE SET NULL,
          FOREIGN KEY (approved_by)
            REFERENCES users(id)
            ON DELETE SET NULL
        );

        INSERT INTO plan_templates_new (
          id,
          incident_type_id,
          version,
          revision,
          title,
          status,
          role_order,
          proposed_incident_type_name,
          proposed_incident_type_description,
          created_by,
          approved_by,
          approved_at,
          created_at
        )
        SELECT
          id,
          incident_type_id,
          version,
          revision,
          title,
          status,
          ${roleOrderValue},
          proposed_incident_type_name,
          proposed_incident_type_description,
          created_by,
          approved_by,
          approved_at,
          created_at
        FROM plan_templates;

        DROP TABLE plan_templates;
        ALTER TABLE plan_templates_new RENAME TO plan_templates;
      `);
    })();
  } finally {
    if (foreignKeysEnabled) {
      db.pragma("foreign_keys = ON");
    }
  }
}

function migrateLegacySchema(db) {
  ensureColumn(
    db,
    "roles",
    "active",
    "ALTER TABLE roles ADD COLUMN active INTEGER NOT NULL DEFAULT 1",
  );
  ensureColumn(
    db,
    "plan_templates",
    "proposed_incident_type_name",
    "ALTER TABLE plan_templates ADD COLUMN proposed_incident_type_name TEXT",
  );
  ensureColumn(
    db,
    "plan_templates",
    "proposed_incident_type_description",
    "ALTER TABLE plan_templates ADD COLUMN proposed_incident_type_description TEXT",
  );
  ensureColumn(
    db,
    "plan_templates",
    "revision",
    "ALTER TABLE plan_templates ADD COLUMN revision INTEGER NOT NULL DEFAULT 1",
  );
  ensureColumn(
    db,
    "plan_templates",
    "role_order",
    "ALTER TABLE plan_templates ADD COLUMN role_order TEXT NOT NULL DEFAULT '[]'",
  );
  ensureColumn(
    db,
    "incidents",
    "nearest_station",
    "ALTER TABLE incidents ADD COLUMN nearest_station TEXT",
  );

  ensureAuditLogUserSetNull(db);
  ensurePlanTemplateUserSetNull(db);
}

module.exports = migrateLegacySchema;
