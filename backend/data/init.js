/**
 * ============================================================
 * Database Initialisation
 * ============================================================
 */

const db = require("./db");

/**
 * Ensures the roles table contains all required columns.
 *
 * Existing databases may have been created before the
 * active column was introduced.
 *
 * @returns {void}
 */
function ensureRolesActiveColumn() {
  const columns = db
    .prepare("PRAGMA table_info(roles)")
    .all()
    .map((column) => column.name);

  if (!columns.includes("active")) {
    db.exec(`
      ALTER TABLE roles
      ADD COLUMN active INTEGER NOT NULL DEFAULT 1;
    `);
  }
}

function ensurePlanTemplateProposedIncidentTypeColumns() {
  const columns = db
    .prepare("PRAGMA table_info(plan_templates)")
    .all()
    .map((column) => column.name);

  if (!columns.includes("proposed_incident_type_name")) {
    db.exec(`
      ALTER TABLE plan_templates
      ADD COLUMN proposed_incident_type_name TEXT;
    `);
  }

  if (!columns.includes("proposed_incident_type_description")) {
    db.exec(`
      ALTER TABLE plan_templates
      ADD COLUMN proposed_incident_type_description TEXT;
    `);
  }
}

/**
 * Allows user deletion without removing audit history.
 *
 * @returns {void}
 */
function ensureAuditLogUserSetNull() {
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

/**
 * Preserves plan templates when their creator or approver is deleted.
 *
 * @returns {void}
 */
function ensurePlanTemplateUserSetNull() {
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
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
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
          title,
          status,
          created_by,
          approved_by,
          approved_at,
          created_at
        )
        SELECT
          id,
          incident_type_id,
          version,
          title,
          status,
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

/**
 * Creates and updates the application database schema.
 *
 * Responsibilities:
 * - Create tables if they do not exist
 * - Apply lightweight schema migrations
 * - Ensure required database structures exist
 *
 * Safe to run multiple times.
 *
 * @returns {void}
 */
function initialiseDatabase() {
  console.log("Initialising database...");

  /**
   * ============================================================
   * Users
   * ============================================================
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      active INTEGER NOT NULL DEFAULT 1,
      token_version INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /**
   * ============================================================
   * Sessions
   * ============================================================
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,

      PRIMARY KEY (
        user_id,
        role_id
      ),

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME,
      revoked_at DATETIME,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_auth_sessions_token_hash
      ON auth_sessions(token_hash);

    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
      ON auth_sessions(user_id);

    CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at
      ON auth_sessions(expires_at);
  `);

  /**
   * ============================================================
   * Login Attempts
   * ============================================================
   *
   * Tracks failed login attempts and temporary account lockouts.
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      email TEXT PRIMARY KEY,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until DATETIME,
      last_failed_at DATETIME
    );

    CREATE INDEX IF NOT EXISTS idx_login_attempts_locked_until
      ON login_attempts(locked_until);
  `);

  /**
   * ============================================================
   * Roles
   * ============================================================
   *
   * Operational roles used within plans.
   *
   * Examples:
   * - Controller
   * - Duty Manager
   * - MOM
   * - Signaller
   * - Customer Information Manager
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );
  `);

  ensureRolesActiveColumn();

  /**
   * ============================================================
   * Incident Types
   * ============================================================
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS incident_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  /**
   * ============================================================
   * Plan Templates
   * ============================================================
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_type_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
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
  `);

  ensurePlanTemplateProposedIncidentTypeColumns();
  ensurePlanTemplateUserSetNull();

  /**
   * ============================================================
   * Plan Stages
   * ============================================================
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_template_id INTEGER NOT NULL,
      stage_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      due_from_incident_start INTEGER NOT NULL,
      UNIQUE (
        plan_template_id,
        stage_number
      ),
      FOREIGN KEY (plan_template_id)
        REFERENCES plan_templates(id)
        ON DELETE CASCADE
    );
  `);

  /**
   * ============================================================
   * Plan Stage Actions
   * ============================================================
   *
   * NOTE:
   * No assigned_role field.
   *
   * Roles are now stored in the
   * plan_stage_action_roles junction table.
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_stage_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_stage_id INTEGER NOT NULL,
      action_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      due_from_stage_start INTEGER,
      due_from_incident_start INTEGER,
      UNIQUE (
        plan_stage_id,
        action_number
      ),
      FOREIGN KEY (plan_stage_id)
        REFERENCES plan_stages(id)
        ON DELETE CASCADE
    );
  `);

  /**
   * ============================================================
   * Plan Stage Action Roles
   * ============================================================
   */
  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_stage_action_roles (
      plan_stage_action_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,

      PRIMARY KEY (
        plan_stage_action_id,
        role_id
      ),

      FOREIGN KEY (plan_stage_action_id)
        REFERENCES plan_stage_actions(id)
        ON DELETE CASCADE,

      FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_type_id INTEGER NOT NULL,
      plan_template_id INTEGER NOT NULL,
      template_version INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      ccil_number TEXT,
      tin_number TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      created_by INTEGER NOT NULL,
      incident_manager_id INTEGER,

      FOREIGN KEY (incident_type_id)
        REFERENCES incident_types(id),

      FOREIGN KEY (plan_template_id)
        REFERENCES plan_templates(id),

      FOREIGN KEY (created_by)
        REFERENCES users(id),

      FOREIGN KEY (incident_manager_id)
        REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS incident_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      original_action_id INTEGER,
      stage_number INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      stage_due_from_incident_start INTEGER,
      action_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      due_from_stage_start INTEGER,
      due_from_incident_start INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      assigned_user_id INTEGER,
      started_at DATETIME,
      completed_at DATETIME,

      FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE CASCADE,

      FOREIGN KEY (assigned_user_id)
        REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS incident_action_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_action_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      update_type TEXT NOT NULL,
      note TEXT,
      previous_status TEXT,
      new_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (incident_action_id)
        REFERENCES incident_actions(id)
        ON DELETE CASCADE,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
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
  `);

  ensureAuditLogUserSetNull();

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id INTEGER PRIMARY KEY,
      preferences TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_incidents_status
    ON incidents(status);

    CREATE INDEX IF NOT EXISTS idx_incidents_started_at
    ON incidents(started_at);

    CREATE INDEX IF NOT EXISTS idx_incidents_incident_type
    ON incidents(incident_type_id);

    CREATE INDEX IF NOT EXISTS idx_incidents_created_by
    ON incidents(created_by);

    CREATE INDEX IF NOT EXISTS idx_incidents_manager
    ON incidents(incident_manager_id);

    CREATE INDEX IF NOT EXISTS idx_incidents_template
    ON incidents(plan_template_id);

    CREATE INDEX IF NOT EXISTS idx_incident_actions_incident
    ON incident_actions(incident_id);

    CREATE INDEX IF NOT EXISTS idx_incident_actions_status
    ON incident_actions(status);

    CREATE INDEX IF NOT EXISTS idx_actions_incident_status
    ON incident_actions(
      incident_id,
      status
    );

    CREATE INDEX IF NOT EXISTS idx_actions_original_action
    ON incident_actions(original_action_id);

    CREATE INDEX IF NOT EXISTS idx_actions_assigned_user
    ON incident_actions(assigned_user_id);

    CREATE INDEX IF NOT EXISTS idx_plan_stages_template
    ON plan_stages(plan_template_id);

    CREATE INDEX IF NOT EXISTS idx_plan_stage_actions_stage
    ON plan_stage_actions(plan_stage_id);

    CREATE INDEX IF NOT EXISTS idx_updates_action
    ON incident_action_updates(incident_action_id);

    CREATE INDEX IF NOT EXISTS idx_updates_created
    ON incident_action_updates(created_at);

    CREATE INDEX IF NOT EXISTS idx_audit_user
    ON audit_logs(user_id);

    CREATE INDEX IF NOT EXISTS idx_audit_created
    ON audit_logs(created_at);

    CREATE INDEX IF NOT EXISTS idx_audit_entity
    ON audit_logs(
      entity_type,
      entity_id
    );
  `);

  console.log("Database initialised");
}

module.exports = initialiseDatabase;
