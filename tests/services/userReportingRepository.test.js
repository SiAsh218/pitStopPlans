const Database = require("better-sqlite3");
const userRepository = require("../../backend/data/repositories/userRepository");

describe("UserRepository reporting query", () => {
  let db;
  let repository;
  let originalDb;

  beforeEach(() => {
    db = new Database(":memory:");
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT,
        active INTEGER NOT NULL,
        token_version INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      INSERT INTO users (
        id, email, password, role, active, token_version, created_at
      ) VALUES
        (1, 'active@example.com', 'secret-hash', 'admin', 1, 4, '2026-01-01'),
        (2, 'disabled@example.com', 'another-hash', 'user', 0, 7, '2026-01-02'),
        (3, 'second@example.com', 'third-hash', 'user', 1, 2, '2026-01-03');
    `);

    repository = userRepository;
    originalDb = repository.db;
    repository.db = db;
  });

  afterEach(() => {
    repository.db = originalDb;
    db.close();
  });

  it("returns only safe user fields", () => {
    const result = repository.findAllForReportingWithQuery({ limit: 1 });

    expect(result.rows).toEqual([
      {
        id: 1,
        email: "active@example.com",
        role: "admin",
        active: 1,
        created_at: "2026-01-01",
      },
    ]);
    expect(result.rows[0]).not.toHaveProperty("password");
    expect(result.rows[0]).not.toHaveProperty("token_version");
    expect(result.meta).toEqual({
      total: 3,
      limit: 1,
      offset: 0,
      page: 1,
      pageCount: 3,
    });
  });

  it("supports safe filters and page offsets", () => {
    const result = repository.findAllForReportingWithQuery({
      active: "true",
      limit: 1,
      page: 2,
    });

    expect(result.rows.map((user) => user.id)).toEqual([3]);
    expect(result.meta).toEqual({
      total: 2,
      limit: 1,
      offset: 1,
      page: 2,
      pageCount: 2,
    });
  });
});
