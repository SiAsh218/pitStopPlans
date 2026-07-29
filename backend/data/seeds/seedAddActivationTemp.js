const db = require("../db.js");

function seedAddActivationTemplate(adminUser) {
  console.log("🌱 Seeding incident plan ADD Activation...");

  /**
   * ========================================
   * Fetch Role IDs
   * ========================================
   */
  const sndmRole = db
    .prepare("SELECT id FROM roles WHERE name = ?")
    .get("SNDM");

  const rcmRole = db.prepare("SELECT id FROM roles WHERE name = ?").get("RCM");

  const infoControllerRole = db
    .prepare("SELECT id FROM roles WHERE name = ?")
    .get("Information Controller");

  const incidentControllerRole = db
    .prepare("SELECT id FROM roles WHERE name = ?")
    .get("Incident Controller");

  const trainRunningControllerRole = db
    .prepare("SELECT id FROM roles WHERE name = ?")
    .get("Train Running Controller");

  /**
   * ========================================
   * Incident Type
   * ========================================
   */
  const incidentTypeResult = db
    .prepare(
      `
        INSERT INTO incident_types
        (
          name,
          description
        )
        VALUES (?, ?)
      `,
    )
    .run(
      "ADD Activation",
      "An incident involving an ADD Activation that impacts service.",
    );

  const incidentTypeId = incidentTypeResult.lastInsertRowid;

  const templateResult = db
    .prepare(
      `INSERT INTO plan_templates
          (
            incident_type_id,
            version,
            title,
            status,
            created_by,
            approved_by,
            approved_at
          )
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `,
    )
    .run(
      incidentTypeId,
      1,
      "ADD Activation Plan",
      "approved",
      adminUser.id,
      adminUser.id,
    );

  const templateId = templateResult.lastInsertRowid;

  /**
   * ========================================
   * Stage 1
   * ========================================
   */
  const stage1Result = db
    .prepare(
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
    )
    .run(templateId, 1, "Initial Response", 10);

  const stage1Id = stage1Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 2
   * ========================================
   */
  const stage2Result = db
    .prepare(
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
    )
    .run(templateId, 2, "Access & Assessments", 30);

  const stage2Id = stage2Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 3
   * ========================================
   */
  const stage3Result = db
    .prepare(
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
    )
    .run(templateId, 3, "Planned Response", 60);

  const stage3Id = stage3Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 4
   * ========================================
   */
  const stage4Result = db
    .prepare(
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
    )
    .run(templateId, 4, "Recovery", 90);

  const stage4Id = stage4Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 1 Action 1
   * ========================================
   */
  const action1Result = db
    .prepare(
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
    )
    .run(
      stage1Id,
      1,
      "Network Rail Senior Leader Advised",
      "On-Call Network Rail senior leader is advised of the incident and its potential impact.",
      10,
      10,
    );

  const action1Id = action1Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 1 Action 2
   * ========================================
   */
  const action2Result = db
    .prepare(
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
    )
    .run(
      stage1Id,
      2,
      "TOC Senior Leader Advised",
      "On-Call TOC senior leader is advised of the incident and its potential impact.",
      10,
      10,
    );

  const action2Id = action2Result.lastInsertRowid;

  /**
   * ========================================
   * Action 1 Action 3
   * ========================================
   */
  const action3Result = db
    .prepare(
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
    )
    .run(
      stage1Id,
      3,
      "Correct Responders have been sent to site",
      "The correct responders have been sent to site to assess the incident and its potential impact.",
      10,
      10,
    );

  const action3Id = action3Result.lastInsertRowid;

  /**
   * ========================================
   * Action Role Assignments
   * ========================================
   */
  const insertActionRole = db.prepare(`
      INSERT INTO plan_stage_action_roles
      (
        plan_stage_action_id,
        role_id
      )
      VALUES (?, ?)
    `);

  // STAGE 1 ROLES
  insertActionRole.run(action1Id, sndmRole.id);
  insertActionRole.run(action2Id, sndmRole.id);
  insertActionRole.run(action2Id, rcmRole.id);

  console.log("✅ Incident plan ADD Activation seeded");
}

module.exports = seedAddActivationTemplate;
