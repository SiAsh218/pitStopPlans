const Database = require("better-sqlite3");

const incidentActionRepository = require("../../backend/data/repositories/incidentActionRepository");

describe("IncidentActionRepository", () => {
  let db;

  beforeAll(() => {
    db = new Database(":memory:");

    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE incident_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incident_id INTEGER NOT NULL,
        original_action_id INTEGER,
        stage_number INTEGER NOT NULL,
        action_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        assigned_user_id INTEGER,
        due_at TEXT
      );

      CREATE TABLE roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE plan_stage_action_roles (
        plan_stage_action_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        PRIMARY KEY (plan_stage_action_id, role_id),
        FOREIGN KEY (role_id)
          REFERENCES roles(id)
          ON DELETE CASCADE
      );
    `);

    incidentActionRepository.db = db;
    incidentActionRepository._columns = null;
  });

  beforeEach(() => {
    db.exec(`
      DELETE FROM incident_actions;
      DELETE FROM plan_stage_action_roles;
      DELETE FROM roles;
    `);

    incidentActionRepository._columns = null;

    db.exec(`
      INSERT INTO roles (id, name)
      VALUES
        (1, 'Controller'),
        (2, 'Incident Manager'),
        (3, 'Operations Manager');

      INSERT INTO plan_stage_action_roles (
        plan_stage_action_id,
        role_id
      )
      VALUES
        (101, 1),
        (101, 2),
        (102, 3);

      INSERT INTO incident_actions (
        id,
        incident_id,
        original_action_id,
        stage_number,
        action_number,
        title,
        description,
        status,
        assigned_user_id,
        due_at
      )
      VALUES
        (
          1,
          10,
          101,
          1,
          2,
          'Second action',
          'Second action for incident 10',
          'in_progress',
          20,
          '2026-08-19T11:00:00.000Z'
        ),
        (
          2,
          10,
          101,
          1,
          1,
          'First action',
          'First action for incident 10',
          'pending',
          10,
          '2026-08-19T10:00:00.000Z'
        ),
        (
          3,
          10,
          102,
          2,
          1,
          'Third action',
          'Second stage action for incident 10',
          'completed',
          30,
          '2026-08-19T09:00:00.000Z'
        ),
        (
          4,
          20,
          101,
          1,
          1,
          'Other incident action',
          'Action belonging to incident 20',
          'pending',
          10,
          '2026-08-20T10:00:00.000Z'
        ),
        (
          5,
          20,
          NULL,
          2,
          1,
          'Unassigned action',
          'Action with no originating plan action',
          'pending',
          NULL,
          '2026-08-20T11:00:00.000Z'
        );
    `);
  });

  afterAll(() => {
    incidentActionRepository.db = undefined;
    db.close();
  });

  describe("findByIncidentId", () => {
    it("returns only actions belonging to the incident", () => {
      const result = incidentActionRepository.findByIncidentId(10);

      expect(result.map((action) => action.id)).toEqual([2, 1, 3]);

      expect(result.every((action) => action.incident_id === 10)).toBe(true);
    });

    it("orders by stage number and then action number", () => {
      const result = incidentActionRepository.findByIncidentId(10);

      expect(
        result.map((action) => [action.stage_number, action.action_number]),
      ).toEqual([
        [1, 1],
        [1, 2],
        [2, 1],
      ]);
    });

    it("returns an empty array when the incident has no actions", () => {
      expect(incidentActionRepository.findByIncidentId(999)).toEqual([]);
    });
  });

  describe("findByIdWithDetails", () => {
    it("returns the requested action", () => {
      const result = incidentActionRepository.findByIdWithDetails(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          incident_id: 10,
          original_action_id: 101,
          stage_number: 1,
          action_number: 2,
          title: "Second action",
          status: "in_progress",
          assigned_user_id: 20,
        }),
      );
    });

    it("returns undefined when the action does not exist", () => {
      expect(incidentActionRepository.findByIdWithDetails(999)).toBeUndefined();
    });
  });

  describe("findAllWithQuery", () => {
    it("returns all actions in stage/action order", () => {
      const result = incidentActionRepository.findAllWithQuery();

      expect(result.rows.map((action) => action.id)).toEqual([2, 4, 1, 3, 5]);
    });

    it("supports pagination while preserving stage/action ordering", () => {
      const result = incidentActionRepository.findAllWithQuery({
        page: 2,
        limit: 2,
      });

      expect(result.rows.map((action) => action.id)).toEqual([4, 3]);

      expect(result.meta).toEqual({
        total: 5,
        limit: 2,
        offset: 2,
        page: 2,
        pageCount: 3,
      });
    });

    it("filters by incident_id", () => {
      const result = incidentActionRepository.findAllWithQuery({
        incident_id: 10,
      });

      expect(result.rows.map((action) => action.id)).toEqual([2, 1, 3]);
    });

    it("filters by status", () => {
      const result = incidentActionRepository.findAllWithQuery({
        status: "pending",
      });

      expect(result.rows.map((action) => action.id)).toEqual([2, 4, 5]);
    });

    it("supports filters supplied through the filters object", () => {
      const result = incidentActionRepository.findAllWithQuery({
        filters: {
          incident_id: 20,
          status: "pending",
        },
      });

      expect(result.rows.map((action) => action.id)).toEqual([4, 5]);
    });

    it("combines direct filters with filters object", () => {
      const result = incidentActionRepository.findAllWithQuery({
        incident_id: 10,
        filters: {
          status: "in_progress",
        },
      });

      expect(result.rows.map((action) => action.id)).toEqual([1]);
    });

    it("ignores unknown filter keys", () => {
      const result = incidentActionRepository.findAllWithQuery({
        does_not_exist: "value",
      });

      expect(result.rows).toHaveLength(5);
    });

    it("supports wildcard filters", () => {
      const result = incidentActionRepository.findAllWithQuery({
        title: "%action%",
      });

      expect(result.rows).toHaveLength(5);
    });

    it("supports null filters", () => {
      const result = incidentActionRepository.findAllWithQuery({
        assigned_user_id: null,
      });

      expect(result.rows.map((action) => action.id)).toEqual([5]);
    });

    it('supports the string "null" as a null filter', () => {
      const result = incidentActionRepository.findAllWithQuery({
        assigned_user_id: "null",
      });

      expect(result.rows.map((action) => action.id)).toEqual([5]);
    });

    it("supports search across action columns", () => {
      const result = incidentActionRepository.findAllWithQuery({
        search: "Third",
      });

      expect(result.rows.map((action) => action.id)).toEqual([3]);
    });

    it("supports q as an alias for search", () => {
      const result = incidentActionRepository.findAllWithQuery({
        q: "Unassigned",
      });

      expect(result.rows.map((action) => action.id)).toEqual([5]);
    });
  });

  describe("findByIncidentIdWithQuery", () => {
    it("always restricts results to the requested incident", () => {
      const result = incidentActionRepository.findByIncidentIdWithQuery(10, {
        status: "pending",
      });

      expect(result.rows.map((action) => action.id)).toEqual([2]);

      expect(result.rows.every((action) => action.incident_id === 10)).toBe(
        true,
      );
    });

    it("preserves stage/action ordering", () => {
      const result = incidentActionRepository.findByIncidentIdWithQuery(10);

      expect(result.rows.map((action) => action.id)).toEqual([2, 1, 3]);
    });

    it("supports pagination", () => {
      const result = incidentActionRepository.findByIncidentIdWithQuery(10, {
        limit: 2,
        page: 2,
      });

      expect(result.rows.map((action) => action.id)).toEqual([3]);

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 2,
        page: 2,
        pageCount: 2,
      });
    });

    it("does not allow the caller to override the incident filter", () => {
      const result = incidentActionRepository.findByIncidentIdWithQuery(10, {
        incident_id: 20,
      });

      expect(result.rows.map((action) => action.incident_id)).toEqual([
        10, 10, 10,
      ]);
    });
  });

  describe("findByIncidentIdWithRolesQuery", () => {
    it("attaches inherited roles to each action", () => {
      const result =
        incidentActionRepository.findByIncidentIdWithRolesQuery(10);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 2,
          roles: [
            {
              id: 1,
              name: "Controller",
            },
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
          id: 2,
          name: "Incident Manager",
        },
      ]);

      expect(result.rows[2].roles).toEqual([
        {
          id: 3,
          name: "Operations Manager",
        },
      ]);
    });

    it("returns an empty roles array when the originating action has no roles", () => {
      const result =
        incidentActionRepository.findByIncidentIdWithRolesQuery(20);

      expect(result.rows).toHaveLength(2);

      expect(result.rows.find((action) => action.id === 5).roles).toEqual([]);
    });

    it("preserves pagination metadata", () => {
      const result = incidentActionRepository.findByIncidentIdWithRolesQuery(
        10,
        {
          limit: 2,
          page: 1,
        },
      );

      expect(result.meta).toEqual({
        total: 3,
        limit: 2,
        offset: 0,
        page: 1,
        pageCount: 2,
      });
    });
  });

  describe("findByIncidentAndStatus", () => {
    it("returns actions matching both incident and status", () => {
      const result = incidentActionRepository.findByIncidentAndStatus(
        10,
        "pending",
      );

      expect(result.map((action) => action.id)).toEqual([2]);
    });

    it("does not return matching statuses from another incident", () => {
      const result = incidentActionRepository.findByIncidentAndStatus(
        10,
        "pending",
      );

      expect(result.every((action) => action.incident_id === 10)).toBe(true);
    });

    it("returns an empty array when nothing matches", () => {
      expect(
        incidentActionRepository.findByIncidentAndStatus(999, "pending"),
      ).toEqual([]);
    });
  });

  describe("findOutstandingByIncidentId", () => {
    it("returns every action whose status is not completed", () => {
      const result = incidentActionRepository.findOutstandingByIncidentId(10);

      expect(result.map((action) => action.id)).toEqual([2, 1]);
    });

    it("does not return completed actions", () => {
      const result = incidentActionRepository.findOutstandingByIncidentId(10);

      expect(result.some((action) => action.status === "completed")).toBe(
        false,
      );
    });

    it("returns an empty array when every action is completed", () => {
      db.prepare(
        `
        UPDATE incident_actions
        SET status = 'completed'
        WHERE incident_id = 10
      `,
      ).run();

      expect(incidentActionRepository.findOutstandingByIncidentId(10)).toEqual(
        [],
      );
    });
  });

  describe("findCompletedByIncidentId", () => {
    it("returns completed actions for the incident", () => {
      const result = incidentActionRepository.findCompletedByIncidentId(10);

      expect(result.map((action) => action.id)).toEqual([3]);
    });

    it("returns an empty array when the incident has no completed actions", () => {
      expect(incidentActionRepository.findCompletedByIncidentId(20)).toEqual(
        [],
      );
    });
  });

  describe("findAssignedToUser", () => {
    it("returns actions assigned to the supplied user", () => {
      const result = incidentActionRepository.findAssignedToUser(10);

      expect(result.map((action) => action.id)).toEqual([2, 4]);
    });

    it("can return assignments across multiple incidents", () => {
      const result = incidentActionRepository.findAssignedToUser(10);

      expect(result.map((action) => action.incident_id)).toEqual([10, 20]);
    });

    it("returns an empty array when the user has no assignments", () => {
      expect(incidentActionRepository.findAssignedToUser(999)).toEqual([]);
    });
  });

  describe("findOverdue", () => {
    it("returns every action that is not completed", () => {
      const result = incidentActionRepository.findOverdue();

      expect(result.map((action) => action.id)).toEqual([1, 2, 4, 5]);
    });

    it("does not return completed actions", () => {
      const result = incidentActionRepository.findOverdue();

      expect(result.some((action) => action.status === "completed")).toBe(
        false,
      );
    });

    it("does not apply incident filtering", () => {
      const result = incidentActionRepository.findOverdue();

      expect(result.map((action) => action.incident_id)).toEqual([
        10, 10, 20, 20,
      ]);
    });
  });

  describe("getRoles", () => {
    it("returns roles inherited from the original plan action", () => {
      const result = incidentActionRepository.getRoles(1);

      expect(result).toEqual([
        {
          id: 1,
          name: "Controller",
        },
        {
          id: 2,
          name: "Incident Manager",
        },
      ]);
    });

    it("returns roles alphabetically by role name", () => {
      const result = incidentActionRepository.getRoles(1);

      expect(result.map((role) => role.name)).toEqual([
        "Controller",
        "Incident Manager",
      ]);
    });

    it("returns an empty array when the action has no original action", () => {
      expect(incidentActionRepository.getRoles(5)).toEqual([]);
    });

    it("returns an empty array when the action does not exist", () => {
      expect(incidentActionRepository.getRoles(999)).toEqual([]);
    });
  });

  describe("findByIncidentIdWithRoles", () => {
    it("returns all actions with their roles", () => {
      const result = incidentActionRepository.findByIncidentIdWithRoles(10);

      expect(result.map((action) => action.id)).toEqual([2, 1, 3]);

      expect(result[0].roles).toEqual([
        {
          id: 1,
          name: "Controller",
        },
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
          id: 2,
          name: "Incident Manager",
        },
      ]);

      expect(result[2].roles).toEqual([
        {
          id: 3,
          name: "Operations Manager",
        },
      ]);
    });

    it("returns an empty array for an incident with no actions", () => {
      expect(incidentActionRepository.findByIncidentIdWithRoles(999)).toEqual(
        [],
      );
    });
  });

  describe("findAllActionRoles", () => {
    it("returns flattened action-role assignments", () => {
      const result = incidentActionRepository.findAllActionRoles();

      expect(result).toEqual([
        {
          action_id: 1,
          incident_id: 10,
          role_id: 1,
          role_name: "Controller",
        },
        {
          action_id: 1,
          incident_id: 10,
          role_id: 2,
          role_name: "Incident Manager",
        },
        {
          action_id: 2,
          incident_id: 10,
          role_id: 1,
          role_name: "Controller",
        },
        {
          action_id: 2,
          incident_id: 10,
          role_id: 2,
          role_name: "Incident Manager",
        },
        {
          action_id: 3,
          incident_id: 10,
          role_id: 3,
          role_name: "Operations Manager",
        },
        {
          action_id: 4,
          incident_id: 20,
          role_id: 1,
          role_name: "Controller",
        },
        {
          action_id: 4,
          incident_id: 20,
          role_id: 2,
          role_name: "Incident Manager",
        },
      ]);
    });

    it("does not include actions without roles", () => {
      const result = incidentActionRepository.findAllActionRoles();

      expect(result.some((row) => row.action_id === 5)).toBe(false);
    });

    it("orders rows by action id", () => {
      const result = incidentActionRepository.findAllActionRoles();

      expect(result.map((row) => row.action_id)).toEqual([1, 1, 2, 2, 3, 4, 4]);
    });
  });

  describe("findAllActionRolesWithQuery", () => {
    it("returns all action-role rows by default", () => {
      const result = incidentActionRepository.findAllActionRolesWithQuery();

      expect(result.rows).toHaveLength(7);
      expect(result.meta.total).toBe(7);
    });

    it("filters by action id", () => {
      const result = incidentActionRepository.findAllActionRolesWithQuery({
        action_id: 1,
      });

      expect(result.rows).toHaveLength(2);
      expect(result.rows.every((row) => row.action_id === 1)).toBe(true);
    });

    it("filters by incident id", () => {
      const result = incidentActionRepository.findAllActionRolesWithQuery({
        incident_id: 20,
      });

      expect(result.rows).toHaveLength(2);
      expect(result.rows.every((row) => row.incident_id === 20)).toBe(true);
    });

    it("filters by role id", () => {
      const result = incidentActionRepository.findAllActionRolesWithQuery({
        role_id: 3,
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({
        action_id: 3,
        incident_id: 10,
        role_id: 3,
        role_name: "Operations Manager",
      });
    });

    it("combines action, incident and role filters", () => {
      const result = incidentActionRepository.findAllActionRolesWithQuery({
        action_id: 1,
        incident_id: 10,
        role_id: 2,
      });

      expect(result.rows).toEqual([
        {
          action_id: 1,
          incident_id: 10,
          role_id: 2,
          role_name: "Incident Manager",
        },
      ]);

      expect(result.meta.total).toBe(1);
    });

    it("supports pagination", () => {
      const result = incidentActionRepository.findAllActionRolesWithQuery({
        limit: 2,
        page: 2,
      });

      expect(result.rows).toEqual([
        {
          action_id: 2,
          incident_id: 10,
          role_id: 1,
          role_name: "Controller",
        },
        {
          action_id: 2,
          incident_id: 10,
          role_id: 2,
          role_name: "Incident Manager",
        },
      ]);

      expect(result.meta).toEqual({
        total: 7,
        limit: 2,
        offset: 2,
        page: 2,
        pageCount: 4,
      });
    });

    it("returns an empty result when no role rows match", () => {
      const result = incidentActionRepository.findAllActionRolesWithQuery({
        role_id: 999,
      });

      expect(result.rows).toEqual([]);

      expect(result.meta.total).toBe(0);
      expect(result.meta.pageCount).toBe(0);
    });
  });

  describe("getRolesForActions", () => {
    it("returns roles for multiple incident actions", () => {
      const result = incidentActionRepository.getRolesForActions([1, 3]);

      expect(result).toEqual([
        {
          action_id: 1,
          id: 1,
          name: "Controller",
        },
        {
          action_id: 1,
          id: 2,
          name: "Incident Manager",
        },
        {
          action_id: 3,
          id: 3,
          name: "Operations Manager",
        },
      ]);
    });

    it("orders results by role name", () => {
      const result = incidentActionRepository.getRolesForActions([1, 3]);

      expect(result.map((row) => row.name)).toEqual([
        "Controller",
        "Incident Manager",
        "Operations Manager",
      ]);
    });

    it("returns an empty array when no action ids are supplied", () => {
      expect(incidentActionRepository.getRolesForActions([])).toEqual([]);
    });

    it("returns an empty array when supplied actions have no roles", () => {
      expect(incidentActionRepository.getRolesForActions([5])).toEqual([]);
    });
  });
});
