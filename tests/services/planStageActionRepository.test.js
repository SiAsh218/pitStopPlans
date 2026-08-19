const Database = require("better-sqlite3");

const planStageActionRepository = require("../../backend/data/repositories/planStageActionRepository");

describe("PlanStageActionRepository", () => {
  let db;

  beforeEach(() => {
    db = new Database(":memory:");

    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE plan_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
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

      CREATE TABLE roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE plan_stage_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_stage_id INTEGER NOT NULL,
        action_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_from_stage_start INTEGER,
        due_from_incident_start INTEGER,
        FOREIGN KEY (plan_stage_id)
          REFERENCES plan_stages(id)
      );

      CREATE TABLE plan_stage_action_roles (
        plan_stage_action_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        PRIMARY KEY (plan_stage_action_id, role_id),
        FOREIGN KEY (plan_stage_action_id)
          REFERENCES plan_stage_actions(id)
          ON DELETE CASCADE,
        FOREIGN KEY (role_id)
          REFERENCES roles(id)
          ON DELETE CASCADE
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

      INSERT INTO plan_stages (
        id,
        plan_template_id,
        stage_number,
        name,
        due_from_incident_start
      )
      VALUES
        (1, 1, 1, 'Stage One', 30),
        (2, 1, 2, 'Stage Two', 60),
        (3, 2, 1, 'Other Template Stage', 15);

      INSERT INTO roles (id, name)
      VALUES
        (1, 'Controller'),
        (2, 'Incident Manager'),
        (3, 'Operations Manager');

      INSERT INTO plan_stage_actions (
        id,
        plan_stage_id,
        action_number,
        title,
        description,
        due_from_stage_start,
        due_from_incident_start
      )
      VALUES
        (
          1,
          1,
          2,
          'Second Action',
          'Second action description',
          20,
          50
        ),
        (
          2,
          1,
          1,
          'First Action',
          'First action description',
          10,
          40
        ),
        (
          3,
          1,
          3,
          'Third Action',
          'Third action description',
          30,
          70
        ),
        (
          4,
          2,
          1,
          'Other Stage Action',
          'Other stage action description',
          5,
          15
        );
    `);

    db.exec(`
      INSERT INTO plan_stage_action_roles (
        plan_stage_action_id,
        role_id
      )
      VALUES
        (1, 1),
        (1, 3),
        (2, 2);
    `);

    planStageActionRepository.db = db;
    planStageActionRepository._columns = null;
  });

  afterEach(() => {
    db.close();
  });

  describe("findByStageId", () => {
    it("returns actions for a stage in action order", () => {
      const result = planStageActionRepository.findByStageId(1);

      expect(result.map((action) => action.id)).toEqual([2, 1, 3]);

      expect(result.map((action) => action.action_number)).toEqual([1, 2, 3]);
    });

    it("returns an empty array when the stage has no actions", () => {
      const result = planStageActionRepository.findByStageId(999);

      expect(result).toEqual([]);
    });
  });

  describe("findByStageIdWithQuery", () => {
    it("returns paginated actions for a stage", () => {
      const result = planStageActionRepository.findByStageIdWithQuery(1, {
        limit: 2,
        page: 1,
      });

      expect(result.rows.map((action) => action.id)).toEqual([2, 1]);

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 0,
        page: 1,
        pageCount: 2,
      });
    });

    it("returns the second page", () => {
      const result = planStageActionRepository.findByStageIdWithQuery(1, {
        limit: 2,
        page: 2,
      });

      expect(result.rows.map((action) => action.id)).toEqual([3]);

      expect(result.meta.offset).toBe(2);
      expect(result.meta.page).toBe(2);
    });

    it("only returns actions belonging to the requested stage", () => {
      const result = planStageActionRepository.findByStageIdWithQuery(1);

      expect(result.rows).toHaveLength(3);

      expect(result.rows.every((action) => action.plan_stage_id === 1)).toBe(
        true,
      );
    });
  });

  describe("findByStageIdWithRolesQuery", () => {
    it("returns paginated actions with their roles", () => {
      const result = planStageActionRepository.findByStageIdWithRolesQuery(1, {
        limit: 2,
        page: 1,
      });

      expect(result.rows).toHaveLength(2);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 2,
          action_number: 1,
          title: "First Action",
          roles: [
            {
              id: 2,
              name: "Incident Manager",
            },
          ],
        }),
      );

      expect(result.rows[1].roles).toEqual([
        {
          id: 1,
          name: "Controller",
        },
        {
          id: 3,
          name: "Operations Manager",
        },
      ]);

      expect(result.meta.total).toBe(3);
    });

    it("returns an empty roles array when an action has no roles", () => {
      const result = planStageActionRepository.findByStageIdWithRolesQuery(2);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].roles).toEqual([]);
    });
  });

  describe("findByStageAndActionNumber", () => {
    it("returns an action by stage and action number", () => {
      const result = planStageActionRepository.findByStageAndActionNumber(1, 2);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          plan_stage_id: 1,
          action_number: 2,
          title: "Second Action",
          description: "Second action description",
          due_from_stage_start: 20,
          due_from_incident_start: 50,
        }),
      );
    });

    it("returns undefined when the action does not exist", () => {
      const result = planStageActionRepository.findByStageAndActionNumber(
        1,
        99,
      );

      expect(result).toBeUndefined();
    });
  });

  describe("getRoles", () => {
    it("returns roles assigned to an action ordered by role name", () => {
      const result = planStageActionRepository.getRoles(1);

      expect(result).toEqual([
        {
          id: 1,
          name: "Controller",
        },
        {
          id: 3,
          name: "Operations Manager",
        },
      ]);
    });

    it("returns an empty array when an action has no roles", () => {
      const result = planStageActionRepository.getRoles(3);

      expect(result).toEqual([]);
    });
  });

  describe("clearRoles", () => {
    it("removes all role assignments for an action", () => {
      expect(planStageActionRepository.getRoles(1)).toHaveLength(2);

      const result = planStageActionRepository.clearRoles(1);

      expect(result.changes).toBe(2);
      expect(planStageActionRepository.getRoles(1)).toEqual([]);
    });

    it("does nothing when the action has no role assignments", () => {
      const result = planStageActionRepository.clearRoles(3);

      expect(result.changes).toBe(0);
    });
  });

  describe("setRoles", () => {
    it("replaces existing role assignments", () => {
      planStageActionRepository.setRoles(1, [2]);

      expect(planStageActionRepository.getRoles(1)).toEqual([
        {
          id: 2,
          name: "Incident Manager",
        },
      ]);
    });

    it("clears roles when an empty array is supplied", () => {
      planStageActionRepository.setRoles(1, []);

      expect(planStageActionRepository.getRoles(1)).toEqual([]);
    });

    it("supports the default empty role list", () => {
      planStageActionRepository.setRoles(2);

      expect(planStageActionRepository.getRoles(2)).toEqual([]);
    });
  });

  describe("getWithRoles", () => {
    it("returns an action with role assignments", () => {
      const result = planStageActionRepository.getWithRoles(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Second Action",
          roles: [
            {
              id: 1,
              name: "Controller",
            },
            {
              id: 3,
              name: "Operations Manager",
            },
          ],
        }),
      );
    });

    it("returns null when the action does not exist", () => {
      const result = planStageActionRepository.getWithRoles(999);

      expect(result).toBeNull();
    });
  });

  describe("findByStageIdWithRoles", () => {
    it("returns all actions for a stage with their roles", () => {
      const result = planStageActionRepository.findByStageIdWithRoles(1);

      expect(result.map((action) => action.id)).toEqual([2, 1, 3]);

      expect(result[0].roles).toEqual([
        {
          id: 2,
          name: "Incident Manager",
        },
      ]);

      expect(result[1].roles).toEqual([
        {
          id: 1,
          name: "Controller",
        },
        {
          id: 3,
          name: "Operations Manager",
        },
      ]);

      expect(result[2].roles).toEqual([]);
    });

    it("returns an empty array when the stage has no actions", () => {
      const result = planStageActionRepository.findByStageIdWithRoles(999);

      expect(result).toEqual([]);
    });
  });

  describe("cloneAction", () => {
    it("clones an action and its role assignments", () => {
      const result = planStageActionRepository.cloneAction(1, 2);

      expect(result).toEqual(
        expect.objectContaining({
          plan_stage_id: 2,
          action_number: 2,
          title: "Second Action",
          description: "Second action description",
          due_from_stage_start: 20,
          due_from_incident_start: 50,
          roles: [
            {
              id: 1,
              name: "Controller",
            },
            {
              id: 3,
              name: "Operations Manager",
            },
          ],
        }),
      );

      expect(result.id).not.toBe(1);

      const cloned = planStageActionRepository.findById(result.id);

      expect(cloned).toEqual(
        expect.objectContaining({
          id: result.id,
          plan_stage_id: 2,
          action_number: 2,
          title: "Second Action",
        }),
      );

      expect(planStageActionRepository.getRoles(result.id)).toEqual([
        {
          id: 1,
          name: "Controller",
        },
        {
          id: 3,
          name: "Operations Manager",
        },
      ]);
    });

    it("clones an action with no roles", () => {
      const result = planStageActionRepository.cloneAction(3, 2);

      expect(result).toEqual(
        expect.objectContaining({
          plan_stage_id: 2,
          action_number: 3,
          title: "Third Action",
          roles: [],
        }),
      );
    });

    it("returns null when the source action does not exist", () => {
      const result = planStageActionRepository.cloneAction(999, 2);

      expect(result).toBeNull();
    });
  });
});
