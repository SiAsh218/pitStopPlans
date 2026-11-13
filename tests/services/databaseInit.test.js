const Database = require("better-sqlite3");
const initialiseDatabase = require("../../backend/data/init");

describe("database initialization", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
  });

  afterEach(() => {
    db.close();
  });

  it("creates the current schema and records its migrations", () => {
    initialiseDatabase(db);

    expect(
      db
        .prepare("PRAGMA table_info(plan_templates)")
        .all()
        .map((column) => column.name),
    ).toEqual(
      expect.arrayContaining([
        "role_order",
        "revision",
        "proposed_incident_type_name",
        "proposed_incident_type_description",
      ]),
    );
    expect(
      db
        .prepare("SELECT version, name FROM schema_migrations ORDER BY version")
        .all(),
    ).toEqual([
      { version: 1, name: "legacy-schema" },
      { version: 2, name: "incident-action-update-reads" },
    ]);

    initialiseDatabase(db);

    expect(db.prepare("SELECT COUNT(*) AS count FROM schema_migrations").get()).toEqual({
      count: 2,
    });
  });
});
