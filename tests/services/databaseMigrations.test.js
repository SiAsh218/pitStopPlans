const Database = require("better-sqlite3");
const runMigrations = require("../../backend/data/migrations");

describe("database migrations", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL
      );
      CREATE TABLE roles (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );
      CREATE TABLE incident_types (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );
      CREATE TABLE plan_templates (
        id INTEGER PRIMARY KEY,
        incident_type_id INTEGER NOT NULL,
        version INTEGER NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        approved_by INTEGER NOT NULL,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_type_id) REFERENCES incident_types(id),
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id)
      );
      CREATE TABLE plan_stages (
        id INTEGER PRIMARY KEY,
        plan_template_id INTEGER NOT NULL,
        FOREIGN KEY (plan_template_id) REFERENCES plan_templates(id)
      );
      CREATE TABLE incidents (
        id INTEGER PRIMARY KEY
      );
      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      INSERT INTO users (id, email) VALUES (1, 'admin@example.test');
      INSERT INTO roles (id, name) VALUES (2, 'SNDM');
      INSERT INTO incident_types (id, name) VALUES (3, 'Example');
      INSERT INTO plan_templates
        (id, incident_type_id, version, title, status, created_by, approved_by)
      VALUES (4, 3, 1, 'Example', 'approved', 1, 1);
      INSERT INTO plan_stages (id, plan_template_id) VALUES (5, 4);
      INSERT INTO audit_logs
        (id, user_id, action, entity_type, entity_id, details)
      VALUES (6, 1, 'CREATE', 'template', 4, '{}');
    `);
  });

  afterEach(() => {
    db.close();
  });

  it("upgrades legacy columns and foreign keys while preserving records", () => {
    runMigrations(db);

    expect(
      db
        .prepare("PRAGMA table_info(plan_templates)")
        .all()
        .map((column) => column.name),
    ).toEqual(
      expect.arrayContaining([
        "revision",
        "role_order",
        "proposed_incident_type_name",
        "proposed_incident_type_description",
      ]),
    );
    expect(
      db
        .prepare("PRAGMA table_info(roles)")
        .all()
        .map((column) => column.name),
    ).toContain("active");
    expect(
      db
        .prepare("PRAGMA table_info(incidents)")
        .all()
        .map((column) => column.name),
    ).toContain("nearest_station");
    expect(
      db
        .prepare("SELECT id, role_order FROM plan_templates")
        .get(),
    ).toEqual({ id: 4, role_order: "[]" });
    expect(db.prepare("SELECT id, user_id FROM audit_logs").get()).toEqual({
      id: 6,
      user_id: 1,
    });
    expect(db.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
    expect(
      db
        .prepare("SELECT version, name FROM schema_migrations ORDER BY version")
        .all(),
    ).toEqual([
      { version: 1, name: "legacy-schema" },
      { version: 2, name: "incident-action-update-reads" },
    ]);

    runMigrations(db);

    expect(db.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get()).toEqual({
      count: 2,
    });
  });
});
