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

const seedTrainFailureTemplate = require("./seeds/seedTrainFailureTemp.js");
const seedAddActivationTemplate = require("./seeds/seedAddActivationTemp.js");

const db = require("./db");
const bcrypt = require("bcrypt");

function seedDatabase() {
  console.log("Checking if seeding is required...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sndmEmail = process.env.SNDM_USER_EMAIL || "sndm@test.com";
  const sndmPassword = process.env.SNDM_USER_PASSWORD;
  const basicEmail = process.env.BASIC_USER_EMAIL || "basic@test.com";
  const basicPassword = process.env.BASIC_USER_PASSWORD;

  /**
   * ============================================================
   * Seed Admin User
   * ============================================================
   */
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();

  if (userCount.count === 0) {
    console.log("🌱 Seeding users...");

    if (adminPassword) {
      const passwordHash = bcrypt.hashSync(
        adminPassword,
        Number(process.env.BCRYPT_SALT || 10),
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
      ).run(adminEmail, passwordHash, "admin");

      console.log("✅ Admin user seeded");
    }

    if (sndmPassword) {
      const sndmPasswordHash = bcrypt.hashSync(
        sndmPassword,
        Number(process.env.BCRYPT_SALT || 10),
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
      ).run(sndmEmail, sndmPasswordHash, "editor");

      console.log("✅ SNDM user seeded");
    }

    if (basicPassword) {
      const basicPasswordHash = bcrypt.hashSync(
        basicPassword,
        Number(process.env.BCRYPT_SALT || 10),
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
      ).run(basicEmail, basicPasswordHash, "user");

      console.log("✅ BASIC user seeded");
    }
  }

  /**
   * ============================================================
   * Get Admin User
   * ============================================================
   */
  const adminUser = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(adminEmail);

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
   * Assign Test User Role
   * ============================================================
   */
  const sndmUser = db
    .prepare(
      `
    SELECT id
    FROM users
    WHERE email = ?
  `,
    )
    .get(sndmEmail);

  const sndmRole = db
    .prepare(
      `
    SELECT id
    FROM roles
    WHERE name = ?
  `,
    )
    .get("SNDM");

  if (sndmUser && sndmRole) {
    db.prepare(
      `
    INSERT OR IGNORE INTO user_roles
    (
      user_id,
      role_id
    )
    VALUES (?, ?)
  `,
    ).run(sndmUser.id, sndmRole.id);

    console.log("✅ SNDM role assigned to test user");
  }

  const templateCount = db
    .prepare("SELECT COUNT(*) as count FROM plan_templates")
    .get();

  if (templateCount.count === 0) {
    console.log("🌱 Seeding incident plans...");
    seedTrainFailureTemplate(adminUser);
    seedAddActivationTemplate(adminUser);
  }

  return;

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
        "Train Failure at Plymouth (Seeded Data for Testing)",
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

          ps.stage_number,
          ps.name AS stage_name,
          ps.due_from_incident_start AS stage_due_from_incident_start

        FROM plan_stage_actions psa

        INNER JOIN plan_stages ps
          ON ps.id = psa.plan_stage_id

        WHERE ps.plan_template_id = ?

        ORDER BY
          ps.stage_number,
          psa.action_number
      `,
      )
      .all(template.id);

    const insertIncidentAction = db.prepare(`
      INSERT INTO incident_actions
      (
        incident_id,
        original_action_id,
        stage_number,
        stage_name,
        stage_due_from_incident_start,
        action_number,
        title,
        description,
        due_from_stage_start,
        due_from_incident_start,
        status,
        assigned_user_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const incidentActionIds = [];

    for (const action of templateActions) {
      const result = insertIncidentAction.run(
        incidentId,
        action.id,
        action.stage_number,
        action.stage_name,
        action.stage_due_from_incident_start,
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
        "Action completed",
        "pending",
        "completed",
      );

      insertUpdate.run(
        incidentActionIds[0],
        adminUser.id,
        "comment",
        "Action started",
        null,
        null,
      );
    }

    if (incidentActionIds.length > 1) {
      insertUpdate.run(
        incidentActionIds[1],
        adminUser.id,
        "status_change",
        "Action started",
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
  INSERT INTO audit_logs
  (
    user_id,
    action,
    entity_type,
    entity_id,
    details
  )
  VALUES (?, ?, ?, ?, ?)
`);

    insertAudit.run(
      adminUser.id,
      "CREATE_INCIDENT",
      "incident",
      incidentId,
      JSON.stringify({
        status: "active",
      }),
    );

    // if (incidentActionIds.length > 0) {
    //   insertAudit.run(
    //     adminUser.id,
    //     "update_status",
    //     "incident_action",
    //     incidentActionIds[0],
    //     JSON.stringify({
    //       field: "status",
    //       from: "pending",
    //       to: "completed",
    //     }),
    //   );
    // }

    // if (incidentActionIds.length > 1) {
    //   insertAudit.run(
    //     adminUser.id,
    //     "update_status",
    //     "incident_action",
    //     incidentActionIds[1],
    //     JSON.stringify({
    //       field: "status",
    //       from: "pending",
    //       to: "in_progress",
    //     }),
    //   );

    console.log("✅ Live incident seeded");
    // }
  }

  console.log("✅ Seeding complete");
}

module.exports = seedDatabase;
