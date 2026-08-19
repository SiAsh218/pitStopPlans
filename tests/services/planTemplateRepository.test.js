const Database = require("better-sqlite3");

const planTemplateRepository = require("../../backend/data/repositories/planTemplateRepository");

describe("PlanTemplateRepository", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");

    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE incident_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE plan_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_type_id INTEGER NOT NULL,
        version INTEGER NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        approved_at TEXT,
        FOREIGN KEY (incident_type_id) REFERENCES incident_types(id)
      );
    `);

    db.exec(`
      INSERT INTO incident_types (id, name)
      VALUES
        (1, 'Train Failure'),
        (2, 'Signal Failure'),
        (3, 'Power Failure');

      INSERT INTO plan_templates (
        id,
        incident_type_id,
        version,
        title,
        status,
        created_at,
        approved_at
      )
      VALUES
        (
          1,
          1,
          1,
          'Train Failure Plan v1',
          'approved',
          '2026-08-15T10:00:00.000Z',
          '2026-08-15T12:00:00.000Z'
        ),
        (
          2,
          1,
          2,
          'Train Failure Plan v2',
          'draft',
          '2026-08-16T10:00:00.000Z',
          NULL
        ),
        (
          3,
          1,
          3,
          'Train Failure Plan v3',
          'approved',
          '2026-08-17T10:00:00.000Z',
          '2026-08-17T12:00:00.000Z'
        ),
        (
          4,
          2,
          1,
          'Signal Failure Plan v1',
          'approved',
          '2026-08-14T10:00:00.000Z',
          '2026-08-14T12:00:00.000Z'
        ),
        (
          5,
          2,
          2,
          'Signal Failure Plan v2',
          'retired',
          '2026-08-18T10:00:00.000Z',
          NULL
        ),
        (
          6,
          3,
          1,
          'Power Failure Plan v1',
          'draft',
          '2026-08-19T10:00:00.000Z',
          NULL
        );
    `);

    planTemplateRepository.db = db;
    planTemplateRepository._columns = null;
  });

  afterEach(() => {
    db.close();
  });

  describe("version lookup", () => {
    it("returns the latest approved version for an incident type", () => {
      const result =
        planTemplateRepository.findLatestApprovedVersionByIncidentType(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 3,
          incident_type_id: 1,
          version: 3,
          status: "approved",
        }),
      );
    });

    it("returns the latest version regardless of status", () => {
      const result = planTemplateRepository.findLatestVersionByIncidentType(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 3,
          incident_type_id: 1,
          version: 3,
        }),
      );
    });

    it("returns a template by incident type and version", () => {
      const result = planTemplateRepository.findByIncidentTypeAndVersion(1, 2);

      expect(result).toEqual(
        expect.objectContaining({
          id: 2,
          incident_type_id: 1,
          version: 2,
          status: "draft",
        }),
      );
    });
  });

  describe("status queries", () => {
    it("returns templates by incident type and status", () => {
      const result = planTemplateRepository.findByIncidentTypeAndStatus(
        1,
        "approved",
      );

      expect(result.map((template) => template.version)).toEqual([3, 1]);
    });

    it("returns templates by status", () => {
      const result = planTemplateRepository.findByStatus("approved");

      expect(result.map((template) => template.id)).toEqual([3, 1, 4]);
    });

    it("returns draft templates", () => {
      const result = planTemplateRepository.findDrafts();

      expect(result.map((template) => template.id)).toEqual([6, 2]);
    });

    it("returns approved templates", () => {
      const result = planTemplateRepository.findApproved();

      expect(result.map((template) => template.id)).toEqual([3, 1, 4]);
    });
  });

  describe("incident type queries", () => {
    it("returns all templates with incident type details", () => {
      const result = planTemplateRepository.findAllWithIncidentType();

      expect(result).toHaveLength(6);

      expect(result[0]).toEqual(
        expect.objectContaining({
          incident_type_name: "Power Failure",
        }),
      );
    });

    it("finds a template by ID with incident type details", () => {
      const result = planTemplateRepository.findByIdWithIncidentType(3);

      expect(result).toEqual(
        expect.objectContaining({
          id: 3,
          title: "Train Failure Plan v3",
          incident_type_name: "Train Failure",
        }),
      );
    });

    it("returns all versions for an incident type", () => {
      const result = planTemplateRepository.findByIncidentTypeId(1);

      expect(result.map((template) => template.version)).toEqual([3, 2, 1]);
    });
  });

  describe("findAllWithQuery", () => {
    it("returns paginated templates with metadata", () => {
      const result = planTemplateRepository.findAllWithQuery({
        limit: 2,
        page: 1,
      });

      expect(result.rows).toHaveLength(2);

      expect(result.meta).toEqual({
        total: 6,
        limit: 2,
        offset: 0,
        page: 1,
        pageCount: 3,
      });
    });

    it("returns the second page", () => {
      const result = planTemplateRepository.findAllWithQuery({
        limit: 2,
        page: 2,
      });

      expect(result.rows).toHaveLength(2);
      expect(result.meta.offset).toBe(2);
      expect(result.meta.page).toBe(2);
    });

    it("supports an explicit offset", () => {
      const result = planTemplateRepository.findAllWithQuery({
        limit: 1,
        offset: 2,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.meta.offset).toBe(2);
    });

    it("filters by a direct template column", () => {
      const result = planTemplateRepository.findAllWithQuery({
        status: "approved",
      });

      expect(result.rows.map((template) => template.id)).toEqual([3, 1, 4]);
    });

    it("filters using the filters object", () => {
      const result = planTemplateRepository.findAllWithQuery({
        filters: {
          incident_type_id: 1,
        },
      });

      expect(result.rows.map((template) => template.id)).toEqual([3, 2, 1]);
    });

    it("combines direct filters with the filters object", () => {
      const result = planTemplateRepository.findAllWithQuery({
        filters: {
          incident_type_id: 1,
        },
        status: "approved",
      });

      expect(result.rows.map((template) => template.id)).toEqual([3, 1]);
    });

    it("ignores unknown filter keys", () => {
      const result = planTemplateRepository.findAllWithQuery({
        definitelyNotAColumn: "something",
      });

      expect(result.meta.total).toBe(6);
    });

    it("sorts by a template column ascending", () => {
      const result = planTemplateRepository.findAllWithQuery({
        sortBy: "version",
        order: "ASC",
      });

      expect(result.rows.map((template) => template.id)).toEqual([
        1, 4, 6, 2, 5, 3,
      ]);
    });

    it("sorts by a template column descending", () => {
      const result = planTemplateRepository.findAllWithQuery({
        sortBy: "version",
        order: "DESC",
      });

      expect(result.rows.map((template) => template.id)).toEqual([
        3, 2, 5, 1, 4, 6,
      ]);
    });

    it("supports the sort alias", () => {
      const result = planTemplateRepository.findAllWithQuery({
        sort: "version",
        order: "DESC",
      });

      expect(result.rows.map((template) => template.id)).toEqual([
        3, 2, 5, 1, 4, 6,
      ]);
    });

    it("sorts by incident type name ascending", () => {
      const result = planTemplateRepository.findAllWithQuery({
        sortBy: "incident_type_name",
        order: "ASC",
      });

      expect(result.rows.map((template) => template.id)).toEqual([
        6, 4, 5, 1, 2, 3,
      ]);
    });

    it("sorts by incident type name descending", () => {
      const result = planTemplateRepository.findAllWithQuery({
        sortBy: "incident_type_name",
        order: "DESC",
      });

      expect(result.rows.map((template) => template.id)).toEqual([
        1, 2, 3, 4, 5, 6,
      ]);
    });

    it("ignores an invalid sort column", () => {
      const result = planTemplateRepository.findAllWithQuery({
        sortBy: "definitely_not_a_column",
      });

      expect(result.rows.map((template) => template.id)).toEqual([
        3, 1, 2, 4, 5, 6,
      ]);
    });
  });
});
