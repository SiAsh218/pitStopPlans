const Database = require("better-sqlite3");

const ensureIncidentActionUpdateReadsTable = require("../../backend/data/migrations/incidentActionUpdateReads");

describe("incident action update reads migration", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE users (id INTEGER PRIMARY KEY);
      CREATE TABLE incident_actions (id INTEGER PRIMARY KEY);
      CREATE TABLE incident_action_updates (
        id INTEGER PRIMARY KEY,
        incident_action_id INTEGER NOT NULL,
        update_type TEXT NOT NULL,
        note TEXT
      );

      INSERT INTO users (id) VALUES (7);
      INSERT INTO incident_actions (id) VALUES (42);
      INSERT INTO incident_action_updates
        (id, incident_action_id, update_type, note)
      VALUES
        (100, 42, 'comment', 'Seen note'),
        (101, 42, 'comment', 'Unread note'),
        (102, 42, 'status_change', 'Action started');
    `);
  });

  afterEach(() => {
    db.close();
  });

  it("creates the current read table on a fresh database", () => {
    ensureIncidentActionUpdateReadsTable(db);

    expect(
      db
        .prepare("PRAGMA table_info(incident_action_update_reads)")
        .all()
        .map((column) => column.name),
    ).toEqual(["user_id", "incident_action_id", "update_id"]);
  });

  it("migrates existing read positions into individual comment receipts", () => {
    db.exec(`
      CREATE TABLE incident_action_update_reads (
        user_id INTEGER NOT NULL,
        incident_action_id INTEGER NOT NULL,
        last_read_update_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, incident_action_id)
      );
      INSERT INTO incident_action_update_reads
        (user_id, incident_action_id, last_read_update_id)
      VALUES (7, 42, 100);
    `);

    ensureIncidentActionUpdateReadsTable(db);

    expect(
      db
        .prepare(
          "SELECT user_id, incident_action_id, update_id FROM incident_action_update_reads",
        )
        .all(),
    ).toEqual([{ user_id: 7, incident_action_id: 42, update_id: 100 }]);
    expect(
      db
        .prepare(
          "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'incident_action_update_reads_legacy'",
        )
        .get(),
    ).toBeUndefined();
  });
});
