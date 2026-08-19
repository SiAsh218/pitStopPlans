// const Database = require("better-sqlite3");

// const incidentActionRepository = require("../../backend/data/repositories/incidentActionRepository");

// describe("IncidentActionRepository", () => {
//   let db;

//   beforeEach(() => {
//     db = new Database(":memory:");

//     db.pragma("foreign_keys = ON");

//     db.exec(`
//       CREATE TABLE roles (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT UNIQUE NOT NULL,
//         active INTEGER NOT NULL DEFAULT 1
//       );

//       CREATE TABLE incidents (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         incident_type_id INTEGER,
//         plan_template_id INTEGER,
//         template_version INTEGER,
//         title TEXT NOT NULL,
//         description TEXT,
//         status TEXT NOT NULL DEFAULT 'active',
//         started_at TEXT,
//         created_by INTEGER
//       );

//       CREATE TABLE plan_stage_actions (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         plan_stage_id INTEGER,
//         action_number INTEGER NOT NULL,
//         title TEXT NOT NULL,
//         description TEXT NOT NULL,
//         due_from_stage_start INTEGER,
//         due_from_incident_start INTEGER
//       );

//       CREATE TABLE plan_stage_action_roles (
//         plan_stage_action_id INTEGER NOT NULL,
//         role_id INTEGER NOT NULL,

//         PRIMARY KEY (
//           plan_stage_action_id,
//           role_id
//         ),

//         FOREIGN KEY (plan_stage_action_id)
//           REFERENCES plan_stage_actions(id)
//           ON DELETE CASCADE,

//         FOREIGN KEY (role_id)
//           REFERENCES roles(id)
//           ON DELETE CASCADE
//       );

//       CREATE TABLE users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         email TEXT UNIQUE NOT NULL
//       );

//       CREATE TABLE incident_actions (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         incident_id INTEGER NOT NULL,
//         original_action_id INTEGER,
//         stage_number INTEGER NOT NULL,
//         stage_name TEXT NOT NULL,
//         stage_due_from_incident_start INTEGER,
//         action_number INTEGER NOT NULL,
//         title TEXT NOT NULL,
//         description TEXT NOT NULL,
//         due_from_stage_start INTEGER,
//         due_from_incident_start INTEGER,
//         status TEXT NOT NULL DEFAULT 'pending',
//         assigned_user_id INTEGER,
//         started_at TEXT,
//         completed_at TEXT,

//         FOREIGN KEY (incident_id)
//           REFERENCES incidents(id)
//           ON DELETE CASCADE,

//         FOREIGN KEY (assigned_user_id)
//           REFERENCES users(id)
//       );
//     `);

//     db.exec(`
//       INSERT INTO roles (id, name)
//       VALUES
//         (1, 'Controller'),
//         (2, 'Duty Manager'),
//         (3, 'Signaller');

//       INSERT INTO users (id, email)
//       VALUES
//         (1, 'alice@example.com'),
//         (2, 'bob@example.com');

//       INSERT INTO incidents (
//         id,
//         title,
//         status
//       )
//       VALUES
//         (1, 'Train Failure Incident', 'active'),
//         (2, 'Signal Failure Incident', 'active');

//       INSERT INTO plan_stage_actions (
//         id,
//         plan_stage_id,
//         action_number,
//         title,
//         description,
//         due_from_stage_start,
//         due_from_incident_start
//       )
//       VALUES
//         (
//           1,
//           1,
//           1,
//           'Contact Controller',
//           'Contact the controller',
//           5,
//           10
//         ),
//         (
//           2,
//           1,
//           2,
//           'Notify Signaller',
//           'Notify the signaller',
//           10,
//           20
//         ),
//         (
//           3,
//           2,
//           1,
//           'Escalate Incident',
//           'Escalate the incident',
//           15,
//           30
//         );

//       INSERT INTO plan_stage_action_roles (
//         plan_stage_action_id,
//         role_id
//       )
//       VALUES
//         (1, 2),
//         (1, 1),
//         (2, 3),
//         (3, 1);

//       INSERT INTO incident_actions (
//         id,
//         incident_id,
//         original_action_id,
//         stage_number,
//         stage_name,
//         stage_due_from_incident_start,
//         action_number,
//         title,
//         description,
//         due_from_stage_start,
//         due_from_incident_start,
//         status,
//         assigned_user_id,
//         started_at,
//         completed_at
//       )
//       VALUES
//         (
//           1,
//           1,
//           1,
//           2,
//           'Response',
//           60,
//           2,
//           'Second Action',
//           'Second action description',
//           10,
//           70,
//           'pending',
//           1,
//           NULL,
//           NULL
//         ),
//         (
//           2,
//           1,
//           1,
//           1,
//           'Initial Response',
//           0,
//           2,
//           'Second Initial Action',
//           'Second initial action description',
//           20,
//           20,
//           'completed',
//           2,
//           '2026-08-19T10:00:00.000Z',
//           '2026-08-19T10:30:00.000Z'
//         ),
//         (
//           3,
//           1,
//           1,
//           1,
//           'Initial Response',
//           0,
//           1,
//           'First Initial Action',
//           'First initial action description',
//           10,
//           10,
//           'pending',
//           NULL,
//           NULL,
//           NULL
//         ),
//         (
//           4,
//           2,
//           2,
//           1,
//           'Signal Response',
//           0,
//           1,
//           'Other Incident Action',
//           'Other incident action description',
//           15,
//           15,
//           'pending',
//           1,
//           NULL,
//           NULL
//         ),
//         (
//           5,
//           1,
//           3,
//           3,
//           'Escalation',
//           90,
//           1,
//           'Completed Escalation',
//           'Completed escalation description',
//           15,
//           105,
//           'completed',
//           1,
//           '2026-08-19T11:00:00.000Z',
//           '2026-08-19T11:30:00.000Z'
//         );
//     `);

//     incidentActionRepository.db = db;
//     incidentActionRepository._columns = null;
//   });

//   afterEach(() => {
//     db.close();
//   });

//   describe("findByIncidentId", () => {
//     it("returns actions for an incident in stage and action order", () => {
//       const result = incidentActionRepository.findByIncidentId(1);

//       expect(result.map((action) => action.id)).toEqual([3, 2, 1, 5]);
//       expect(
//         result.map((action) => [action.stage_number, action.action_number]),
//       ).toEqual([
//         [1, 1],
//         [1, 2],
//         [2, 2],
//         [3, 1],
//       ]);
//     });

//     it("returns an empty array when the incident has no actions", () => {
//       const result = incidentActionRepository.findByIncidentId(999);

//       expect(result).toEqual([]);
//     });
//   });

//   describe("findByIdWithDetails", () => {
//     it("returns the action by ID", () => {
//       const result = incidentActionRepository.findByIdWithDetails(3);

//       expect(result).toEqual(
//         expect.objectContaining({
//           id: 3,
//           incident_id: 1,
//           title: "First Initial Action",
//         }),
//       );
//     });

//     it("returns undefined when the action does not exist", () => {
//       const result = incidentActionRepository.findByIdWithDetails(999);

//       expect(result).toBeUndefined();
//     });
//   });

//   describe("findAllWithQuery", () => {
//     it("returns actions in stage and action order", () => {
//       const result = incidentActionRepository.findAllWithQuery();

//       expect(result.rows.map((action) => action.id)).toEqual([3, 2, 4, 1, 5]);
//     });

//     it("supports filtering", () => {
//       const result = incidentActionRepository.findAllWithQuery({
//         status: "completed",
//       });

//       expect(result.rows.map((action) => action.id)).toEqual([2, 5]);
//       expect(result.meta.total).toBe(2);
//     });

//     it("supports pagination", () => {
//       const result = incidentActionRepository.findAllWithQuery({
//         limit: 2,
//         page: 2,
//       });

//       expect(result.rows.map((action) => action.id)).toEqual([4, 1]);
//       expect(result.meta).toEqual({
//         total: 5,
//         limit: 2,
//         offset: 2,
//         page: 2,
//         pageCount: 3,
//       });
//     });
//   });

//   describe("findByIncidentIdWithQuery", () => {
//     it("returns paginated actions for the requested incident", () => {
//       const result = incidentActionRepository.findByIncidentIdWithQuery(1, {
//         limit: 2,
//         page: 1,
//       });

//       expect(result.rows.map((action) => action.id)).toEqual([3, 2]);
//       expect(result.meta.total).toBe(4);
//       expect(result.meta.limit).toBe(2);
//       expect(result.meta.offset).toBe(0);
//       expect(result.meta.page).toBe(1);
//       expect(result.meta.pageCount).toBe(2);
//     });

//     it("only returns actions belonging to the requested incident", () => {
//       const result = incidentActionRepository.findByIncidentIdWithQuery(1);

//       expect(result.rows).toHaveLength(4);
//       expect(result.rows.every((action) => action.incident_id === 1)).toBe(
//         true,
//       );
//     });
//   });

//   describe("findByIncidentIdWithRolesQuery", () => {
//     it("returns paginated actions with their roles", () => {
//       const result = incidentActionRepository.findByIncidentIdWithRolesQuery(1);

//       const firstAction = result.rows.find((action) => action.id === 3);
//       const secondAction = result.rows.find((action) => action.id === 2);
//       const thirdAction = result.rows.find((action) => action.id === 1);

//       expect(firstAction.roles).toEqual([
//         {
//           id: 1,
//           name: "Controller",
//         },
//         {
//           id: 2,
//           name: "Duty Manager",
//         },
//       ]);

//       expect(secondAction.roles).toEqual([
//         {
//           id: 3,
//           name: "Signaller",
//         },
//       ]);

//       expect(thirdAction.roles).toEqual([
//         {
//           id: 1,
//           name: "Controller",
//         },
//         {
//           id: 2,
//           name: "Duty Manager",
//         },
//       ]);
//     });

//     it("returns an empty roles array when no roles are assigned", () => {
//       db.prepare(
//         `
//         INSERT INTO incident_actions (
//           id,
//           incident_id,
//           stage_number,
//           stage_name,
//           action_number,
//           title,
//           description,
//           status
//         )
//         VALUES (
//           6,
//           1,
//           4,
//           'No Role Stage',
//           1,
//           'No Role Action',
//           'Action without roles',
//           'pending'
//         )
//       `,
//       ).run();

//       const result = incidentActionRepository.findByIncidentIdWithRolesQuery(1);

//       const action = result.rows.find((item) => item.id === 6);

//       expect(action.roles).toEqual([]);
//     });
//   });

//   describe("findByIncidentAndStatus", () => {
//     it("returns actions matching the incident and status", () => {
//       const result = incidentActionRepository.findByIncidentAndStatus(
//         1,
//         "completed",
//       );

//       expect(result.map((action) => action.id)).toEqual([2, 5]);
//     });
//   });

//   describe("findOutstandingByIncidentId", () => {
//     it("returns actions that are not completed", () => {
//       const result = incidentActionRepository.findOutstandingByIncidentId(1);

//       expect(result.map((action) => action.id)).toEqual([3, 1]);
//       expect(result.every((action) => action.status !== "completed")).toBe(
//         true,
//       );
//     });
//   });

//   describe("findCompletedByIncidentId", () => {
//     it("returns completed actions for an incident", () => {
//       const result = incidentActionRepository.findCompletedByIncidentId(1);

//       expect(result.map((action) => action.id)).toEqual([2, 5]);
//     });
//   });

//   describe("findAssignedToUser", () => {
//     it("returns actions assigned to a user", () => {
//       const result = incidentActionRepository.findAssignedToUser(1);

//       expect(result.map((action) => action.id)).toEqual([2, 4, 5]);
//     });

//     it("returns an empty array when the user has no assigned actions", () => {
//       const result = incidentActionRepository.findAssignedToUser(999);

//       expect(result).toEqual([]);
//     });
//   });

//   describe("findOverdue", () => {
//     it("returns all non-completed actions", () => {
//       const result = incidentActionRepository.findOverdue();

//       expect(result.map((action) => action.id)).toEqual([1, 3, 4]);
//       expect(result.every((action) => action.status !== "completed")).toBe(
//         true,
//       );
//     });
//   });

//   describe("getRoles", () => {
//     it("returns roles for an action ordered by role name", () => {
//       const result = incidentActionRepository.getRoles(3);

//       expect(result).toEqual([
//         {
//           id: 1,
//           name: "Controller",
//         },
//         {
//           id: 2,
//           name: "Duty Manager",
//         },
//       ]);
//     });

//     it("returns an empty array when an action has no roles", () => {
//       const result = incidentActionRepository.getRoles(999);

//       expect(result).toEqual([]);
//     });
//   });

//   describe("findByIncidentIdWithRoles", () => {
//     it("returns all incident actions with roles", () => {
//       const result = incidentActionRepository.findByIncidentIdWithRoles(1);

//       const action = result.find((item) => item.id === 3);

//       expect(action.roles).toEqual([
//         {
//           id: 1,
//           name: "Controller",
//         },
//         {
//           id: 2,
//           name: "Duty Manager",
//         },
//       ]);
//     });

//     it("returns an empty array when the incident has no actions", () => {
//       const result = incidentActionRepository.findByIncidentIdWithRoles(999);

//       expect(result).toEqual([]);
//     });
//   });

//   describe("findAllActionRoles", () => {
//     it("returns all action-role assignments", () => {
//       const result = incidentActionRepository.findAllActionRoles();

//       expect(result).toEqual([
//         {
//           action_id: 1,
//           incident_id: 1,
//           role_id: 1,
//           role_name: "Controller",
//         },
//         {
//           action_id: 1,
//           incident_id: 1,
//           role_id: 2,
//           role_name: "Duty Manager",
//         },
//         {
//           action_id: 2,
//           incident_id: 1,
//           role_id: 3,
//           role_name: "Signaller",
//         },
//         {
//           action_id: 3,
//           incident_id: 1,
//           role_id: 1,
//           role_name: "Controller",
//         },
//       ]);
//     });
//   });

//   describe("findAllActionRolesWithQuery", () => {
//     it("returns all action-role assignments with metadata", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery();

//       expect(result.rows).toHaveLength(4);
//       expect(result.meta).toEqual({
//         total: 4,
//         limit: 1000,
//         offset: 0,
//         page: 1,
//         pageCount: 1,
//       });
//     });

//     it("filters by action ID", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery({
//         action_id: 1,
//       });

//       expect(result.rows).toEqual([
//         {
//           action_id: 1,
//           incident_id: 1,
//           role_id: 1,
//           role_name: "Controller",
//         },
//         {
//           action_id: 1,
//           incident_id: 1,
//           role_id: 2,
//           role_name: "Duty Manager",
//         },
//       ]);

//       expect(result.meta.total).toBe(2);
//     });

//     it("filters by incident ID", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery({
//         incident_id: 2,
//       });

//       expect(result.rows).toEqual([]);
//       expect(result.meta.total).toBe(0);
//     });

//     it("filters by role ID", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery({
//         role_id: 3,
//       });

//       expect(result.rows).toEqual([
//         {
//           action_id: 2,
//           incident_id: 1,
//           role_id: 3,
//           role_name: "Signaller",
//         },
//       ]);
//     });

//     it("combines filters", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery({
//         action_id: 1,
//         incident_id: 1,
//         role_id: 2,
//       });

//       expect(result.rows).toEqual([
//         {
//           action_id: 1,
//           incident_id: 1,
//           role_id: 2,
//           role_name: "Duty Manager",
//         },
//       ]);

//       expect(result.meta.total).toBe(1);
//     });

//     it("supports pagination", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery({
//         limit: 2,
//         page: 2,
//       });

//       expect(result.rows).toEqual([
//         {
//           action_id: 2,
//           incident_id: 1,
//           role_id: 3,
//           role_name: "Signaller",
//         },
//         {
//           action_id: 3,
//           incident_id: 1,
//           role_id: 1,
//           role_name: "Controller",
//         },
//       ]);

//       expect(result.meta).toEqual({
//         total: 4,
//         limit: 2,
//         offset: 2,
//         page: 2,
//         pageCount: 2,
//       });
//     });

//     it("uses the minimum limit of 1", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery({
//         limit: 0,
//       });

//       expect(result.meta.limit).toBe(1000);
//     });

//     it("caps the maximum limit at 10000", () => {
//       const result = incidentActionRepository.findAllActionRolesWithQuery({
//         limit: 50000,
//       });

//       expect(result.meta.limit).toBe(10000);
//     });
//   });

//   describe("getRolesForActions", () => {
//     it("returns roles for multiple actions", () => {
//       const result = incidentActionRepository.getRolesForActions([1, 2, 3]);

//       expect(result).toEqual([
//         {
//           action_id: 1,
//           id: 1,
//           name: "Controller",
//         },
//         {
//           action_id: 1,
//           id: 2,
//           name: "Duty Manager",
//         },
//         {
//           action_id: 2,
//           id: 3,
//           name: "Signaller",
//         },
//         {
//           action_id: 3,
//           id: 1,
//           name: "Controller",
//         },
//       ]);
//     });

//     it("returns an empty array for an empty action list", () => {
//       const result = incidentActionRepository.getRolesForActions([]);

//       expect(result).toEqual([]);
//     });
//   });

//   describe("_attachRoles", () => {
//     it("attaches roles to supplied actions", () => {
//       const actions = [
//         {
//           id: 1,
//           title: "Action One",
//         },
//         {
//           id: 999,
//           title: "Action Without Roles",
//         },
//       ];

//       const result = incidentActionRepository._attachRoles(actions);

//       expect(result).toEqual([
//         {
//           id: 1,
//           title: "Action One",
//           roles: [
//             {
//               id: 1,
//               name: "Controller",
//             },
//             {
//               id: 2,
//               name: "Duty Manager",
//             },
//           ],
//         },
//         {
//           id: 999,
//           title: "Action Without Roles",
//           roles: [],
//         },
//       ]);
//     });

//     it("returns an empty array for no actions", () => {
//       expect(incidentActionRepository._attachRoles([])).toEqual([]);
//     });
//   });
// });
