/**
 * ============================================================
 * Database Seeding
 * ============================================================
 *
 * Purpose:
 * - Populates the database with initial/default data
 * - Ensures required baseline records exist
 *
 * Safe to run multiple times.
 * ============================================================
 */

const db = require("./db");
const bcrypt = require("bcrypt");

function seedDatabase() {
  console.log("Checking if seeding is required...");

  /**
   * ============================================================
   * Seed Admin User
   * ============================================================
   */
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();

  if (userCount.count === 0) {
    console.log("🌱 Seeding users...");

    const passwordHash = bcrypt.hashSync(
      "admin123",
      Number(process.env.BCRYPT_SALT_ROUNDS),
    );

    db.prepare(
      `
      INSERT INTO users
      (
        email,
        password,
        role
      )
      VALUES (?, ?, ?)
    `,
    ).run("admin@test.com", passwordHash, "admin");

    console.log("✅ Admin user seeded");
  }

  /**
   * ============================================================
   * Get Admin User
   * ============================================================
   */
  const adminUser = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get("admin@test.com");

  /**
   * ============================================================
   * Seed Roles
   * ============================================================
   */
  const roleCount = db.prepare("SELECT COUNT(*) as count FROM roles").get();

  if (roleCount.count === 0) {
    console.log("🌱 Seeding roles...");

    const insertRole = db.prepare(`
      INSERT INTO roles (name)
      VALUES (?)
    `);

    insertRole.run("SNDM");
    insertRole.run("RCM");
    insertRole.run("Information Controller");
    insertRole.run("Incident Controller");
    insertRole.run("Train Running Controller");

    console.log("✅ Roles seeded");
  }

  /**
   * ============================================================
   * Seed Incident Plans
   * ============================================================
   */
  const templateCount = db
    .prepare("SELECT COUNT(*) as count FROM plan_templates")
    .get();

  if (templateCount.count === 0) {
    console.log("🌱 Seeding incident plans...");

    /**
     * ========================================
     * Fetch Role IDs
     * ========================================
     */
    const sndmRole = db
      .prepare("SELECT id FROM roles WHERE name = ?")
      .get("SNDM");

    const rcmRole = db
      .prepare("SELECT id FROM roles WHERE name = ?")
      .get("RCM");

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
        "Train Failure",
        "An incident involving a train failure that impacts service.",
      );

    const incidentTypeId = incidentTypeResult.lastInsertRowid;

    /**
     * ========================================
     * Plan Template
     * ========================================
     */
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
        "Train Failure Pit Stop Plan",
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
     * Action 1
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
     * Action 2
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
     * Action 3
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
        stage2Id,
        1,
        "Command Structure Established",
        "Does the command structure need to be established? If so, establish it.",
        20,
        30,
      );

    const action3Id = action3Result.lastInsertRowid;

    /**
     * ========================================
     * Action 4
     * ========================================
     */
    const action4Result = db
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
        stage2Id,
        2,
        "Train Service Management Conference",
        "If required, a Train Service Management Conference is held to discuss the incident and its potential impact.",
        20,
        30,
      );

    const action4Id = action4Result.lastInsertRowid;

    /**
     * ========================================
     * Action 5
     * ========================================
     */
    const action5Result = db
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

    const action5Id = action5Result.lastInsertRowid;

    /**
     * ========================================
     * Action 6
     * ========================================
     */
    const action6Result = db
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
        4,
        "TOC Duty Control Manager Advised",
        "The TOC Duty Control Manager has been advised of the incident.",
        10,
        10,
      );

    const action6Id = action6Result.lastInsertRowid;

    /**
     * ========================================
     * Action 7
     * ========================================
     */
    const action7Result = db
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
        5,
        "Confirm Tactical Plan",
        "Confirm the tactical plan with the IC and TOC control lead.  Prepare for escalation if necessary.",
        10,
        10,
      );

    const action7Id = action7Result.lastInsertRowid;

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

    // Add roles to actions
    insertActionRole.run(action1Id, sndmRole.id);

    // insertActionRole.run(action1Id, rcmRole.id); can have multiple assigned to the same action

    insertActionRole.run(action2Id, sndmRole.id);

    insertActionRole.run(action3Id, sndmRole.id);

    insertActionRole.run(action4Id, sndmRole.id);

    insertActionRole.run(action5Id, rcmRole.id);

    insertActionRole.run(action6Id, rcmRole.id);

    insertActionRole.run(action7Id, rcmRole.id);

    console.log("✅ Incident plans seeded");
  }

  /**
   * ============================================================
   * Seed Live Incident
   * ============================================================
   */
  const incidentCount = db
    .prepare("SELECT COUNT(*) as count FROM incidents")
    .get();

  if (incidentCount.count === 0) {
    console.log("🌱 Seeding live incident...");

    const template = db
      .prepare(
        `
    SELECT *
    FROM plan_templates
    WHERE status = 'approved'
    ORDER BY version DESC
    LIMIT 1
  `,
      )
      .get();

    const incidentType = db
      .prepare("SELECT * FROM incident_types LIMIT 1")
      .get();

    /**
     * ========================================
     * Create Incident
     * ========================================
     */
    const incidentResult = db
      .prepare(
        `
      INSERT INTO incidents
      (
        incident_type_id,
        plan_template_id,
        template_version,
        title,
        description,
        status,
        created_by,
        incident_manager_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        incidentType.id,
        template.id,
        template.version,
        "Train Failure at Plymouth",
        "Unit failed approaching Plymouth station causing delays.",
        "active",
        adminUser.id,
        adminUser.id,
      );

    const incidentId = incidentResult.lastInsertRowid;

    /**
     * ========================================
     * Generate Incident Action Snapshots
     * ========================================
     */
    const templateActions = db
      .prepare(
        `
    SELECT
      psa.id,
      psa.action_number,
      psa.title,
      psa.description,
      psa.due_from_stage_start,
      psa.due_from_incident_start,
      ps.stage_number
    FROM plan_stage_actions psa
    INNER JOIN plan_stages ps
      ON ps.id = psa.plan_stage_id
    ORDER BY
      ps.stage_number,
      psa.action_number
  `,
      )
      .all();

    const insertIncidentAction = db.prepare(`
    INSERT INTO incident_actions
    (
      incident_id,
      original_action_id,
      stage_number,
      action_number,
      title,
      description,
      due_from_stage_start,
      due_from_incident_start,
      status,
      assigned_user_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const incidentActionIds = [];

    for (const action of templateActions) {
      const result = insertIncidentAction.run(
        incidentId,
        action.id,
        action.stage_number,
        action.action_number,
        action.title,
        action.description,
        action.due_from_stage_start,
        action.due_from_incident_start,
        "pending",
        adminUser.id,
      );

      incidentActionIds.push(result.lastInsertRowid);
    }

    /**
     * ========================================
     * Completed Action
     * ========================================
     */
    if (incidentActionIds.length > 0) {
      db.prepare(
        `
      UPDATE incident_actions
      SET
        status = 'completed',
        started_at = datetime('now', '-15 minutes'),
        completed_at = datetime('now', '-10 minutes')
      WHERE id = ?
    `,
      ).run(incidentActionIds[0]);
    }

    /**
     * ========================================
     * In Progress Action
     * ========================================
     */
    if (incidentActionIds.length > 1) {
      db.prepare(
        `
      UPDATE incident_actions
      SET
        status = 'in_progress',
        started_at = datetime('now', '-5 minutes')
      WHERE id = ?
    `,
      ).run(incidentActionIds[1]);
    }

    /**
     * ========================================
     * Action Updates
     * ========================================
     */
    const insertUpdate = db.prepare(`
    INSERT INTO incident_action_updates
    (
      incident_action_id,
      user_id,
      update_type,
      note,
      previous_status,
      new_status
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    if (incidentActionIds.length > 0) {
      insertUpdate.run(
        incidentActionIds[0],
        adminUser.id,
        "status_change",
        "Network Rail senior leader contacted and acknowledged incident.",
        "pending",
        "completed",
      );

      insertUpdate.run(
        incidentActionIds[0],
        adminUser.id,
        "comment",
        "Resources mobilised and situation assessment underway.",
        null,
        null,
      );
    }

    if (incidentActionIds.length > 1) {
      insertUpdate.run(
        incidentActionIds[1],
        adminUser.id,
        "status_change",
        "Incident response is currently underway.",
        "pending",
        "in_progress",
      );
    }

    /**
     * ========================================
     * Audit Log Entries
     * ========================================
     */
    const insertAudit = db.prepare(`
    INSERT INTO audit_log
    (
      user_id,
      entity_type,
      entity_id,
      action,
      field_name,
      old_value,
      new_value
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    insertAudit.run(
      adminUser.id,
      "incident",
      incidentId,
      "create",
      null,
      null,
      "active",
    );

    if (incidentActionIds.length > 0) {
      insertAudit.run(
        adminUser.id,
        "incident_action",
        incidentActionIds[0],
        "update_status",
        "status",
        "pending",
        "completed",
      );
    }

    if (incidentActionIds.length > 1) {
      insertAudit.run(
        adminUser.id,
        "incident_action",
        incidentActionIds[1],
        "update_status",
        "status",
        "pending",
        "in_progress",
      );

      console.log("✅ Live incident seeded");
    }

    console.log("✅ Live incident seeded");
  }

  console.log("✅ Seeding complete");
}

module.exports = seedDatabase;
