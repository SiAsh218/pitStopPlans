const Database = require("better-sqlite3");

const incidentRepository = require("../../backend/data/repositories/incidentRepository");

describe("IncidentRepository", () => {
  let db;

  beforeAll(() => {
    db = new Database(":memory:");

    db.pragma("foreign_keys = ON");

    // Minimal schema required by IncidentRepository.
    db.exec(`
      CREATE TABLE incident_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL
      );

      CREATE TABLE incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_type_id INTEGER NOT NULL,
        plan_template_id INTEGER,
        template_version INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        ccil_number TEXT,
        tin_number TEXT,
        status TEXT NOT NULL,
        created_by INTEGER NOT NULL,
        incident_manager_id INTEGER,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        closed_at TEXT,
        FOREIGN KEY (incident_type_id) REFERENCES incident_types(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `);

    incidentRepository.db = db;

    // BaseRepository caches table columns.
    incidentRepository._columns = null;
  });

  beforeEach(() => {
    db.exec(`
      DELETE FROM incidents;
      DELETE FROM incident_types;
      DELETE FROM users;
    `);

    // Reset cached columns in case the schema is inspected again.
    incidentRepository._columns = null;

    db.exec(`
      INSERT INTO incident_types (id, name)
      VALUES
        (1, 'Train Failure'),
        (2, 'Signal Failure'),
        (3, 'Power Failure');

      INSERT INTO users (id, email)
      VALUES
        (1, 'alice@test.com'),
        (2, 'bob@test.com');

      INSERT INTO incidents (
        id,
        incident_type_id,
        plan_template_id,
        template_version,
        title,
        description,
        ccil_number,
        tin_number,
        status,
        created_by,
        incident_manager_id,
        started_at,
        closed_at
      )
      VALUES
        (
          1,
          1,
          10,
          2,
          'Broken Train',
          'Train has failed',
          'CCIL-001',
          'TIN-001',
          'active',
          1,
          1,
          '2026-08-19T10:00:00.000Z',
          NULL
        ),
        (
          2,
          2,
          20,
          1,
          'Signal Failure',
          'Signal has failed',
          'CCIL-002',
          'TIN-002',
          'closed',
          2,
          2,
          '2026-08-18T10:00:00.000Z',
          '2026-08-19T09:00:00.000Z'
        ),
        (
          3,
          3,
          30,
          1,
          'Power Failure',
          'Power lost at station',
          NULL,
          NULL,
          'active',
          1,
          1,
          '2026-08-17T10:00:00.000Z',
          NULL
        );
    `);
  });

  afterAll(() => {
    incidentRepository.db = undefined;
    db.close();
  });

  describe("findByIdWithDetails", () => {
    it("returns an incident with incident type and creator details", () => {
      const result = incidentRepository.findByIdWithDetails(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Broken Train",
          description: "Train has failed",
          ccil_number: "CCIL-001",
          tin_number: "TIN-001",
          status: "active",
          incident_type_id: 1,
          incident_type_name: "Train Failure",
          created_by: 1,
          created_by_email: "alice@test.com",
        }),
      );
    });

    it("returns undefined when the incident does not exist", () => {
      const result = incidentRepository.findByIdWithDetails(999);

      expect(result).toBeUndefined();
    });
  });

  describe("findAllWithDetails", () => {
    it("returns all incidents with related details", () => {
      const result = incidentRepository.findAllWithDetails();

      expect(result).toHaveLength(3);

      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 1,
          incident_type_name: "Train Failure",
          created_by_email: "alice@test.com",
        }),
      );

      expect(result[1]).toEqual(
        expect.objectContaining({
          id: 2,
          incident_type_name: "Signal Failure",
          created_by_email: "bob@test.com",
        }),
      );
    });

    it("orders incidents by started_at descending", () => {
      const result = incidentRepository.findAllWithDetails();

      expect(result.map((incident) => incident.id)).toEqual([1, 2, 3]);
    });
  });

  describe("findAllWithDetailsQuery", () => {
    it("returns paginated incidents", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        page: 1,
        limit: 2,
      });

      expect(result.rows).toHaveLength(2);

      expect(result.rows.map((incident) => incident.id)).toEqual([1, 2]);

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 0,
        page: 1,
        pageCount: 2,
      });
    });

    it("returns the second page", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        page: 2,
        limit: 2,
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
      const result = incidentRepository.findAllWithDetailsQuery({
        limit: 1,
        offset: 1,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(2);

      expect(result.meta.offset).toBe(1);
    });

    it("filters by a direct incident column", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        status: "active",
      });

      expect(result.rows).toHaveLength(2);
      expect(
        result.rows.every((incident) => incident.status === "active"),
      ).toBe(true);
    });

    it("filters using the filters object", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        filters: {
          incident_type_id: 2,
        },
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(2);
    });

    it("combines direct filters with filters object", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        filters: {
          incident_type_id: 1,
        },
        status: "active",
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(1);
    });

    it("ignores unknown filter keys", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        does_not_exist: "anything",
      });

      expect(result.rows).toHaveLength(3);
    });

    it("supports wildcard filters", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        title: "%Failure%",
      });

      expect(result.rows).toHaveLength(2);

      expect(result.rows.map((incident) => incident.id)).toEqual([2, 3]);
    });

    it("supports null filters", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        ccil_number: null,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(3);
    });

    it('supports the string "null" filter', () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        tin_number: "null",
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(3);
    });

    it("supports search", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        search: "Signal",
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(2);
    });

    it("supports q as an alias for search", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        q: "Power",
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(3);
    });

    it("supports sorting by a valid column", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        sortBy: "title",
        order: "ASC",
      });

      expect(result.rows.map((incident) => incident.title)).toEqual([
        "Broken Train",
        "Power Failure",
        "Signal Failure",
      ]);
    });

    it("supports descending sort order", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        sortBy: "title",
        order: "DESC",
      });

      expect(result.rows.map((incident) => incident.title)).toEqual([
        "Signal Failure",
        "Power Failure",
        "Broken Train",
      ]);
    });

    it("supports sort as an alias for sortBy", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        sort: "title",
        order: "ASC",
      });

      expect(result.rows[0].title).toBe("Broken Train");
    });

    it("supports sorting by incident type name", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        sortBy: "incident_type_name",
        order: "ASC",
      });

      expect(result.rows.map((incident) => incident.id)).toEqual([3, 2, 1]);
    });

    it("falls back to the default sort for an invalid sort column", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        sortBy: "not_a_real_column",
        order: "ASC",
      });

      expect(result.rows.map((incident) => incident.id)).toEqual([1, 2, 3]);
    });

    it("defaults to ascending order for an invalid order", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        sortBy: "title",
        order: "INVALID",
      });

      expect(result.rows.map((incident) => incident.title)).toEqual([
        "Broken Train",
        "Power Failure",
        "Signal Failure",
      ]);
    });

    it("uses the default limit when limit is missing", () => {
      const result = incidentRepository.findAllWithDetailsQuery({});

      expect(result.meta.limit).toBe(25);
    });

    it("enforces a minimum limit of 1", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        limit: 0,
      });

      expect(result.meta.limit).toBe(25);
    });

    it("caps the limit at 200", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        limit: 500,
      });

      expect(result.meta.limit).toBe(200);
    });

    it("defaults page to 1 for an invalid page", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        page: 0,
      });

      expect(result.meta.page).toBe(1);
      expect(result.meta.offset).toBe(0);
    });

    it("supports searching across related incident details", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        search: "alice@test.com",
      });

      expect(result.rows).toHaveLength(2);

      expect(result.rows.map((incident) => incident.id)).toEqual([1, 3]);
    });

    it("supports combined search and filtering", () => {
      const result = incidentRepository.findAllWithDetailsQuery({
        search: "Failure",
        status: "closed",
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].id).toBe(2);
    });
  });

  describe("insertIncident", () => {
    it("inserts an incident", () => {
      const result = incidentRepository.insertIncident({
        incident_type_id: 1,
        plan_template_id: 40,
        template_version: 3,
        title: "New Incident",
        description: "Something went wrong",
        ccil_number: "CCIL-999",
        tin_number: "TIN-999",
        status: "active",
        created_by: 1,
        incident_manager_id: 1,
      });

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeGreaterThan(0);

      const inserted = db
        .prepare("SELECT * FROM incidents WHERE id = ?")
        .get(result.lastInsertRowid);

      expect(inserted).toEqual(
        expect.objectContaining({
          title: "New Incident",
          description: "Something went wrong",
          ccil_number: "CCIL-999",
          tin_number: "TIN-999",
          status: "active",
          incident_type_id: 1,
          plan_template_id: 40,
          template_version: 3,
          created_by: 1,
          incident_manager_id: 1,
        }),
      );
    });

    it("allows nullable incident fields", () => {
      const result = incidentRepository.insertIncident({
        incident_type_id: 1,
        plan_template_id: 40,
        template_version: 1,
        title: "Minimal Incident",
        description: null,
        ccil_number: null,
        tin_number: null,
        status: "active",
        created_by: 1,
        incident_manager_id: 1,
      });

      const inserted = db
        .prepare("SELECT * FROM incidents WHERE id = ?")
        .get(result.lastInsertRowid);

      expect(inserted.description).toBeNull();
      expect(inserted.ccil_number).toBeNull();
      expect(inserted.tin_number).toBeNull();
    });
  });

  describe("findByStatus", () => {
    it("returns incidents matching the supplied status", () => {
      const result = incidentRepository.findByStatus("active");

      expect(result).toHaveLength(2);
      expect(result.every((incident) => incident.status === "active")).toBe(
        true,
      );
    });

    it("returns closed incidents", () => {
      const result = incidentRepository.findByStatus("closed");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("returns an empty array when no incidents match", () => {
      const result = incidentRepository.findByStatus("cancelled");

      expect(result).toEqual([]);
    });
  });

  describe("findOpen", () => {
    it("returns active incidents", () => {
      const result = incidentRepository.findOpen();

      expect(result).toHaveLength(2);
      expect(result.every((incident) => incident.status === "active")).toBe(
        true,
      );
    });
  });

  describe("findClosed", () => {
    it("returns closed incidents", () => {
      const result = incidentRepository.findClosed();

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("closed");
    });
  });
});
