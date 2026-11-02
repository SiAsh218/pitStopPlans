const Database = require("better-sqlite3");

const incidentActionUpdateRepository = require("../../backend/data/repositories/incidentActionUpdateRepository");

describe("IncidentActionUpdateRepository read tracking", () => {
  let db;

  beforeAll(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY
      );

      CREATE TABLE incident_actions (
        id INTEGER PRIMARY KEY
      );

      CREATE TABLE incident_action_updates (
        id INTEGER PRIMARY KEY,
        incident_action_id INTEGER NOT NULL,
        update_type TEXT NOT NULL,
        note TEXT
      );

      CREATE TABLE incident_action_update_reads (
        user_id INTEGER NOT NULL,
        incident_action_id INTEGER NOT NULL,
        update_id INTEGER NOT NULL,
        PRIMARY KEY (user_id, update_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (incident_action_id)
          REFERENCES incident_actions(id) ON DELETE CASCADE,
        FOREIGN KEY (update_id)
          REFERENCES incident_action_updates(id) ON DELETE CASCADE
      );
    `);

    incidentActionUpdateRepository.db = db;

    db.exec(`
      INSERT INTO users (id) VALUES (7);
      INSERT INTO incident_actions (id) VALUES (42);
      INSERT INTO incident_action_updates (
        id,
        incident_action_id,
        update_type,
        note
      )
      VALUES
        (100, 42, 'comment', 'First note'),
        (101, 42, 'comment', 'Second note');
    `);
  });

  afterAll(() => {
    db.close();
  });

  it("persists read receipts for the specific comments", () => {
    incidentActionUpdateRepository.markCommentsAsRead(7, 42, [100, 101]);

    expect(
      db
        .prepare(
          "SELECT user_id, incident_action_id, update_id FROM incident_action_update_reads ORDER BY update_id",
        )
        .all(),
    ).toEqual([
      { user_id: 7, incident_action_id: 42, update_id: 100 },
      { user_id: 7, incident_action_id: 42, update_id: 101 },
    ]);

    incidentActionUpdateRepository.markCommentsAsRead(7, 42, [100, 101]);

    expect(
      db.prepare("SELECT COUNT(*) AS count FROM incident_action_update_reads").get()
        .count,
    ).toBe(2);
  });
});
