const Database = require("better-sqlite3");

const BaseRepository = require("../../backend/data/repositories/baseRepository");

class CustomSearchRepository extends BaseRepository {
  getSearchableColumns() {
    return ["name", "description"];
  }
}

describe("BaseRepository", () => {
  let db;
  let repository;

  beforeEach(() => {
    db = new Database(":memory:");

    db.exec(`
      CREATE TABLE test_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        active INTEGER DEFAULT 1
      );

      INSERT INTO test_items (
        id,
        name,
        description,
        status,
        active
      )
      VALUES
        (1, 'Alpha', 'First item', 'active', 1),
        (2, 'Beta', 'Second item', 'closed', 0),
        (3, 'Gamma', 'Failure item', 'active', 1);
    `);

    repository = new BaseRepository("test_items");
    repository.db = db;
  });

  afterEach(() => {
    db.close();
  });

  describe("getColumns", () => {
    it("returns the table columns", () => {
      expect(repository.getColumns()).toEqual([
        "id",
        "name",
        "description",
        "status",
        "active",
      ]);
    });

    it("caches the table columns", () => {
      const firstResult = repository.getColumns();
      const secondResult = repository.getColumns();

      expect(secondResult).toBe(firstResult);
    });
  });

  describe("getSearchableColumns", () => {
    it("returns the table columns", () => {
      expect(repository.getSearchableColumns()).toEqual([
        "id",
        "name",
        "description",
        "status",
        "active",
      ]);
    });
  });

  describe("findAll", () => {
    it("returns all rows", () => {
      const result = repository.findAll();

      expect(result).toHaveLength(3);

      expect(result.map((row) => row.name)).toEqual(["Alpha", "Beta", "Gamma"]);
    });
  });

  describe("findById", () => {
    it("returns a row by ID", () => {
      const result = repository.findById(2);

      expect(result).toEqual(
        expect.objectContaining({
          id: 2,
          name: "Beta",
          status: "closed",
        }),
      );
    });

    it("returns undefined when the row does not exist", () => {
      expect(repository.findById(999)).toBeUndefined();
    });
  });

  describe("insert", () => {
    it("inserts a row", () => {
      const result = repository.insert({
        name: "Delta",
        description: "Fourth item",
        status: "active",
        active: 1,
      });

      expect(result.changes).toBe(1);

      const inserted = repository.findById(result.lastInsertRowid);

      expect(inserted).toEqual(
        expect.objectContaining({
          name: "Delta",
          description: "Fourth item",
          status: "active",
          active: 1,
        }),
      );
    });

    it("throws when no fields are supplied", () => {
      expect(() => repository.insert({})).toThrow(
        "No fields supplied for insert",
      );
    });
  });

  describe("updateById", () => {
    it("updates a row", () => {
      const result = repository.updateById(1, {
        name: "Updated Alpha",
        status: "closed",
      });

      expect(result.changes).toBe(1);

      const updated = repository.findById(1);

      expect(updated.name).toBe("Updated Alpha");
      expect(updated.status).toBe("closed");
    });

    it("throws when no fields are supplied", () => {
      expect(() => repository.updateById(1, {})).toThrow(
        "No fields supplied for update",
      );
    });
  });

  describe("deleteById", () => {
    it("deletes a row", () => {
      const result = repository.deleteById(2);

      expect(result.changes).toBe(1);
      expect(repository.findById(2)).toBeUndefined();
    });
  });

  describe("findAllWithQuery", () => {
    it("returns paginated results with metadata", () => {
      const result = repository.findAllWithQuery({
        limit: 2,
        page: 1,
      });

      expect(result.rows).toHaveLength(2);

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 0,
        page: 1,
        pageCount: 2,
      });
    });

    it("returns the second page", () => {
      const result = repository.findAllWithQuery({
        limit: 2,
        page: 2,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(3);

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 2,
        page: 2,
        pageCount: 2,
      });
    });

    it("supports an explicit offset", () => {
      const result = repository.findAllWithQuery({
        limit: 1,
        offset: 2,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(3);
      expect(result.meta.offset).toBe(2);
    });

    it("filters by a direct column", () => {
      const result = repository.findAllWithQuery({
        status: "active",
      });

      expect(result.rows.map((row) => row.id)).toEqual([1, 3]);
    });

    it("filters using the filters object", () => {
      const result = repository.findAllWithQuery({
        filters: {
          status: "closed",
        },
      });

      expect(result.rows.map((row) => row.id)).toEqual([2]);
    });

    it("combines direct filters with filters object", () => {
      const result = repository.findAllWithQuery({
        filters: {
          status: "active",
        },
        name: "Gamma",
      });

      expect(result.rows.map((row) => row.id)).toEqual([3]);
    });

    it("ignores unknown filter keys", () => {
      const result = repository.findAllWithQuery({
        notARealColumn: "something",
      });

      expect(result.rows).toHaveLength(3);
    });
  });

  it("supports searching across searchable columns", () => {
    const result = repository.findAllWithQuery({
      search: "Failure",
    });

    expect(result.rows.map((row) => row.id)).toEqual([3]);
  });

  it("searches across the name column", () => {
    const result = repository.findAllWithQuery({
      search: "Gamma",
    });

    expect(result.rows.map((row) => row.id)).toEqual([3]);
  });

  it("rejects unknown insert columns", () => {
    expect(() => {
      repository.insert({
        name: "Test",
        definitely_not_a_column: "bad",
      });
    }).toThrow("Unknown column: definitely_not_a_column");
  });

  it("uses overridden searchable columns", () => {
    const customRepository = new CustomSearchRepository("test_items");
    customRepository.db = db;

    const result = customRepository.findAllWithQuery({
      search: "active",
    });

    expect(result.rows).toHaveLength(0);
  });

  it("rejects unknown update columns", () => {
    expect(() => {
      repository.updateById(1, {
        definitely_not_a_column: "bad",
      });
    }).toThrow("Unknown column: definitely_not_a_column");
  });
});
