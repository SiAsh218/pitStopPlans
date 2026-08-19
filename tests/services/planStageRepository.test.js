const Database = require("better-sqlite3");

const planStageRepository = require("../../backend/data/repositories/planStageRepository");

describe("PlanStageRepository", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");

    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE plan_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_type_id INTEGER,
        version INTEGER NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        approved_at TEXT
      );

      CREATE TABLE plan_stages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_template_id INTEGER NOT NULL,
        stage_number INTEGER NOT NULL,
        name TEXT NOT NULL,
        due_from_incident_start INTEGER,
        FOREIGN KEY (plan_template_id)
          REFERENCES plan_templates(id)
      );
    `);

    db.exec(`
      INSERT INTO plan_templates (
        id,
        version,
        title,
        status,
        created_at
      )
      VALUES
        (1, 1, 'Template One', 'approved', '2026-08-15T10:00:00.000Z'),
        (2, 1, 'Template Two', 'draft', '2026-08-16T10:00:00.000Z');
    `);

    db.exec(`
      INSERT INTO plan_stages (
        id,
        plan_template_id,
        stage_number,
        name,
        due_from_incident_start
      )
      VALUES
        (1, 1, 2, 'Stage Two', 60),
        (2, 1, 1, 'Stage One', 30),
        (3, 1, 3, 'Stage Three', 90),
        (4, 2, 1, 'Other Template Stage', 15);
    `);

    planStageRepository.db = db;
    planStageRepository._columns = null;
  });

  afterEach(() => {
    db.close();
  });

  describe("findByTemplateId", () => {
    it("returns stages for a template in stage order", () => {
      const result = planStageRepository.findByTemplateId(1);

      expect(result.map((stage) => stage.id)).toEqual([2, 1, 3]);
      expect(result.map((stage) => stage.stage_number)).toEqual([1, 2, 3]);
    });

    it("returns an empty array when the template has no stages", () => {
      const result = planStageRepository.findByTemplateId(999);

      expect(result).toEqual([]);
    });
  });

  describe("findByTemplateIdWithQuery", () => {
    it("returns paginated stages for a template", () => {
      const result = planStageRepository.findByTemplateIdWithQuery(1, {
        limit: 2,
        page: 1,
      });

      expect(result.rows.map((stage) => stage.id)).toEqual([2, 1]);
      expect(result.meta.total).toBe(3);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.offset).toBe(0);
      expect(result.meta.pageCount).toBe(2);
    });

    it("returns the second page", () => {
      const result = planStageRepository.findByTemplateIdWithQuery(1, {
        limit: 2,
        page: 2,
      });

      expect(result.rows.map((stage) => stage.id)).toEqual([3]);
      expect(result.meta.offset).toBe(2);
      expect(result.meta.page).toBe(2);
    });

    it("only returns stages belonging to the requested template", () => {
      const result = planStageRepository.findByTemplateIdWithQuery(1);

      expect(result.rows).toHaveLength(3);
      expect(result.rows.every((stage) => stage.plan_template_id === 1)).toBe(
        true,
      );
    });
  });

  describe("findByTemplateAndStageNumber", () => {
    it("returns a stage by template and stage number", () => {
      const result = planStageRepository.findByTemplateAndStageNumber(1, 2);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          plan_template_id: 1,
          stage_number: 2,
          name: "Stage Two",
          due_from_incident_start: 60,
        }),
      );
    });

    it("returns undefined when the stage does not exist", () => {
      const result = planStageRepository.findByTemplateAndStageNumber(1, 99);

      expect(result).toBeUndefined();
    });
  });

  describe("cloneStage", () => {
    it("clones an existing stage into another template", () => {
      const result = planStageRepository.cloneStage(1, 2);

      expect(result).toEqual(
        expect.objectContaining({
          plan_template_id: 2,
          stage_number: 2,
          name: "Stage Two",
          due_from_incident_start: 60,
        }),
      );

      expect(result.id).not.toBe(1);

      const cloned = planStageRepository.findById(result.id);

      expect(cloned).toEqual(result);
    });

    it("returns null when the source stage does not exist", () => {
      const result = planStageRepository.cloneStage(999, 2);

      expect(result).toBeNull();
    });
  });
});
