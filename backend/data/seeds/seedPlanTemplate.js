const db = require("../db");

const STAGE_DUE_TIMES = [10, 30, 60, 90];
const ACTION_DUE_TIMES = [10, 20, 30, 30];

function seedPlanTemplate(adminUser, plan) {
  if (!adminUser || !adminUser.id) {
    throw new Error(`Cannot seed ${plan.name}: admin user is required`);
  }

  const existingType = db
    .prepare("SELECT id FROM incident_types WHERE name = ?")
    .get(plan.name);

  if (existingType) {
    db.prepare(
      "UPDATE plan_templates SET title = ? WHERE incident_type_id = ?",
    ).run(plan.name, existingType.id);
    return;
  }

  const roleIds = new Map();
  const getRoleId = (name) => {
    const roleName = name.replace(/\s+/g, " ").trim();

    if (!roleIds.has(roleName)) {
      const role = db
        .prepare("SELECT id FROM roles WHERE name = ?")
        .get(roleName);

      if (!role) {
        throw new Error(
          `Cannot seed ${plan.name}: role "${roleName}" was not found`,
        );
      }

      roleIds.set(roleName, role.id);
    }

    return roleIds.get(roleName);
  };

  const seed = db.transaction(() => {
    const incidentType = db
      .prepare(
        `
          INSERT INTO incident_types (name, description)
          VALUES (?, ?)
        `,
      )
      .run(plan.name, plan.description);

    const template = db
      .prepare(
        `
          INSERT INTO plan_templates
          (
            incident_type_id,
            version,
            title,
            status,
            created_by,
            approved_by,
            approved_at
          )
          VALUES (?, ?, ?, 'approved', ?, ?, datetime('now'))
        `,
      )
      .run(
        incidentType.lastInsertRowid,
        plan.version,
        plan.name,
        adminUser.id,
        adminUser.id,
      );

    const insertStage = db.prepare(
      `
        INSERT INTO plan_stages
        (
          plan_template_id,
          stage_number,
          name,
          due_from_incident_start
        )
        VALUES (?, ?, ?, ?)
      `,
    );
    const insertAction = db.prepare(
      `
        INSERT INTO plan_stage_actions
        (
          plan_stage_id,
          action_number,
          title,
          description,
          due_from_stage_start,
          due_from_incident_start
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    );
    const insertActionRole = db.prepare(
      `
        INSERT INTO plan_stage_action_roles (plan_stage_action_id, role_id)
        VALUES (?, ?)
      `,
    );

    plan.stages.forEach((stage, stageIndex) => {
      const stageResult = insertStage.run(
        template.lastInsertRowid,
        stageIndex + 1,
        stage.name,
        STAGE_DUE_TIMES[stageIndex],
      );

      stage.actions.forEach((action, actionIndex) => {
        const actionResult = insertAction.run(
          stageResult.lastInsertRowid,
          actionIndex + 1,
          action.title,
          action.description,
          ACTION_DUE_TIMES[stageIndex],
          STAGE_DUE_TIMES[stageIndex],
        );

        action.roles.forEach((roleName) => {
          insertActionRole.run(
            actionResult.lastInsertRowid,
            getRoleId(roleName),
          );
        });
      });
    });
  });

  seed();
  console.log(`✅ Incident plan ${plan.name} seeded`);
}

module.exports = seedPlanTemplate;
