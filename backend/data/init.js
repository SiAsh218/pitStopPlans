/**
 * ============================================================
 * Database Initialisation
 * ============================================================
 */

const db = require("./db");

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
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
      name TEXT UNIQUE NOT NULL
    );
  `);

  /**
   * ============================================================
   * User Roles
   * ============================================================
   *
   * Allows users to have multiple operational roles.
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
      created_by INTEGER NOT NULL,
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
        REFERENCES users(id),
      FOREIGN KEY (approved_by)
        REFERENCES users(id)
    );
  `);

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
   *
   * Supports:
   *
   * Action:
   * Notify Signaller
   *
   * Roles:
   * Controller
   * Duty Manager
   *
   * Stored as:
   * action_id | role_id
   * ----------|--------
   *     1      |    1
   *     1      |    2
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
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      field_name TEXT,
      old_value TEXT,
      new_value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id)
        REFERENCES users(id)
    );
  `);

  console.log("Database initialised");
}

module.exports = initialiseDatabase;
