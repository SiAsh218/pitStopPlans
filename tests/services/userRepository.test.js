const Database = require("better-sqlite3");

const userRepository = require("../../backend/data/repositories/userRepository");

describe("UserRepository", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");

    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        token_version INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE user_roles (
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (role_id) REFERENCES roles(id)
      );
    `);

    db.exec(`
      INSERT INTO roles (id, name)
      VALUES
        (1, 'Driver'),
        (2, 'Manager'),
        (3, 'Administrator');

      INSERT INTO users (
        id,
        email,
        password,
        role,
        active,
        token_version
      )
      VALUES
        (
          1,
          'alice@test.com',
          'hash-alice',
          'user',
          1,
          0
        ),
        (
          2,
          'bob@test.com',
          'hash-bob',
          'manager',
          1,
          2
        ),
        (
          3,
          'charlie@test.com',
          'hash-charlie',
          'admin',
          0,
          4
        );

      INSERT INTO user_roles (user_id, role_id)
      VALUES
        (1, 1),
        (2, 2),
        (3, 3);
    `);

    userRepository.db = db;
    userRepository._columns = null;
  });

  afterEach(() => {
    db.close();
  });

  describe("findByEmail", () => {
    it("returns a user by email", () => {
      const result = userRepository.findByEmail("alice@test.com");

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email: "alice@test.com",
          role: "user",
        }),
      );
    });

    it("returns undefined when the email does not exist", () => {
      expect(userRepository.findByEmail("missing@test.com")).toBeUndefined();
    });
  });

  describe("createUser", () => {
    it("creates and returns a user", () => {
      const result = userRepository.createUser(
        "new@test.com",
        "new-password-hash",
        "user",
      );

      expect(result).toEqual(
        expect.objectContaining({
          email: "new@test.com",
          password: "new-password-hash",
          role: "user",
        }),
      );

      expect(result.id).toBeDefined();
    });
  });

  describe("updateUser", () => {
    it("returns null when the user does not exist", () => {
      const result = userRepository.updateUser(999, {
        password: "new-hash",
      });

      expect(result).toBeNull();
    });

    it("returns the existing user when there are no updates", () => {
      const result = userRepository.updateUser(1, {});

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          email: "alice@test.com",
          password: "hash-alice",
          role: "user",
          token_version: 0,
        }),
      );
    });

    it("updates the password without changing token version", () => {
      const result = userRepository.updateUser(1, {
        password: "new-hash",
      });

      expect(result.password).toBe("new-hash");
      expect(result.token_version).toBe(0);
    });

    it("updates the role and increments token version", () => {
      const result = userRepository.updateUser(1, {
        role: "manager",
      });

      expect(result.role).toBe("manager");
      expect(result.token_version).toBe(1);
    });

    it("updates the password and role together", () => {
      const result = userRepository.updateUser(2, {
        password: "new-bob-hash",
        role: "admin",
      });

      expect(result.password).toBe("new-bob-hash");
      expect(result.role).toBe("admin");
      expect(result.token_version).toBe(3);
    });
  });

  describe("setActive", () => {
    it("disables an active user and increments token version", () => {
      const result = userRepository.setActive(1, false);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          active: 0,
          token_version: 1,
        }),
      );
    });

    it("enables a disabled user and increments token version", () => {
      const result = userRepository.setActive(3, true);

      expect(result).toEqual(
        expect.objectContaining({
          id: 3,
          active: 1,
          token_version: 5,
        }),
      );
    });

    it("returns undefined when the user does not exist", () => {
      const result = userRepository.setActive(999, false);

      expect(result).toBeUndefined();
    });
  });

  describe("findAllWithQuery", () => {
    it("returns paginated users", () => {
      const result = userRepository.findAllWithQuery({
        limit: 2,
        page: 1,
      });

      expect(result.rows).toHaveLength(2);

      expect(result.rows.map((user) => user.email)).toEqual([
        "alice@test.com",
        "bob@test.com",
      ]);

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 0,
        page: 1,
        pageCount: 2,
      });
    });

    it("returns the second page", () => {
      const result = userRepository.findAllWithQuery({
        limit: 2,
        page: 2,
      });

      expect(result.rows).toHaveLength(1);

      expect(result.rows[0].email).toBe("charlie@test.com");

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 2,
        page: 2,
        pageCount: 2,
      });
    });

    it("filters by application role", () => {
      const result = userRepository.findAllWithQuery({
        appRole: "manager",
      });

      expect(result.rows).toHaveLength(1);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 2,
          email: "bob@test.com",
          role: "manager",
        }),
      );

      expect(result.meta.total).toBe(1);
    });

    it("filters active users", () => {
      const result = userRepository.findAllWithQuery({
        active: "active",
      });

      expect(result.rows.map((user) => user.id)).toEqual([1, 2]);
      expect(result.meta.total).toBe(2);
    });

    it("filters disabled users", () => {
      const result = userRepository.findAllWithQuery({
        active: "disabled",
      });

      expect(result.rows.map((user) => user.id)).toEqual([3]);
      expect(result.meta.total).toBe(1);
    });

    it("filters by job role", () => {
      const result = userRepository.findAllWithQuery({
        jobRole: "Driver",
      });

      expect(result.rows).toHaveLength(1);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 1,
          email: "alice@test.com",
        }),
      );

      expect(result.meta.total).toBe(1);
    });

    it("searches by email", () => {
      const result = userRepository.findAllWithQuery({
        search: "alice",
      });

      expect(result.rows).toHaveLength(1);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 1,
          email: "alice@test.com",
        }),
      );

      expect(result.meta.total).toBe(1);
    });

    it("searches by application role", () => {
      const result = userRepository.findAllWithQuery({
        search: "manager",
      });

      expect(result.rows).toHaveLength(1);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 2,
          email: "bob@test.com",
          role: "manager",
        }),
      );

      expect(result.meta.total).toBe(1);
    });

    it("searches by job role", () => {
      const result = userRepository.findAllWithQuery({
        search: "Driver",
      });

      expect(result.rows).toHaveLength(1);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 1,
          email: "alice@test.com",
        }),
      );

      expect(result.meta.total).toBe(1);
    });
  });
});
