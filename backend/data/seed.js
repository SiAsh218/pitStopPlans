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

  const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn("ADMIN_PASSWORD not set. Skipping admin user seed.");
  }

  /**
   * ============================================================
   * Seed Admin User
   * ============================================================
   */
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();

  if (userCount.count === 0 && adminPassword) {
    console.log("🌱 Seeding users...");

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
     * Action 1 Action 4
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
        stage1Id,
        4,
        "TOC Duty Control Manager Advised",
        "The TOC Duty Control Manager has been advised of the incident.",
        10,
        10,
      );

    const action4Id = action4Result.lastInsertRowid;

    /**
     * ========================================
     * Atage 1 Action 5
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
        5,
        "Confirm Tactical Plan",
        "Confirm the tactical plan with the IC and TOC control lead.  Prepare for escalation if necessary.",
        10,
        10,
      );

    const action5Id = action5Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 6
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
        6,
        "Categorisation of Incident",
        "Confirm the incident Categorisation",
        10,
        10,
      );

    const action6Id = action6Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 7
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
        7,
        "Communicate Initial Categorisation",
        "Send initial BLACK, RED, AMBER to stakeholders based on latest information currently available",
        10,
        10,
      );

    const action7Id = action7Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 8
     * ========================================
     */
    const action8Result = db
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
        8,
        "Gather Incident Information",
        "Understand as much about the incident as possible.",
        10,
        10,
      );

    const action8Id = action8Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 9
     * ========================================
     */
    const action9Result = db
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
        9,
        "Confirmed Failure?",
        "Fitters dispatched and ETA?  Has suitable Assistance been identified and what is the ETA?",
        10,
        10,
      );

    const action9Id = action9Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 10
     * ========================================
     */
    const action10Result = db
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
        10,
        "Receive Infromation from IC as to the nature of the failure",
        "Liasse with TOC and agree recovery arrangements as directed by the IC",
        10,
        10,
      );

    const action10Id = action10Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 11
     * ========================================
     */
    const action11Result = db
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
        11,
        "Confirm immediate tactical plan",
        "Confirm immediate tactical plan and prepare for escalation as necessary",
        10,
        10,
      );

    const action11Id = action11Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 12
     * ========================================
     */
    const action12Result = db
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
        12,
        "Identify Contingency Plan",
        "Identify the relevant contingency plan based on the information you have",
        10,
        10,
      );

    const action12Id = action12Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 1 Action 13
     * ========================================
     */
    const action13Result = db
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
        13,
        "TOCs Informed of Contingency Plan",
        "Train Operators have been informed of which contingency plan is being put in place",
        10,
        10,
      );

    const action13Id = action13Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 1
     * ========================================
     */
    const action31Result = db
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

    const action31Id = action31Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 2
     * ========================================
     */
    const action32Result = db
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

    const action32Id = action32Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 3
     * ========================================
     */
    const action33Result = db
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
        3,
        "Incident Management Conference",
        "Incident management conference held including those on the on call matrix",
        20,
        30,
      );

    const action33Id = action33Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 4
     * ========================================
     */
    const action34Result = db
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
        4,
        "Advise NOC",
        "Advise NOC if in the Thames Valley Area",
        20,
        30,
      );

    const action34Id = action34Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 5
     * ========================================
     */
    const action35Result = db
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
        5,
        "Huddles with IC & TRC teams",
        "Following Tactical/Strategic Conferences huddles be undertaken to provide details of decisions and vreate a shared solutional awareness, recorded in CCIL",
        20,
        30,
      );

    const action35Id = action35Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 6
     * ========================================
     */
    const action36Result = db
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
        6,
        "Confirm MFSdC process has been implemented",
        "If appropriate",
        20,
        30,
      );

    const action36Id = action36Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 7
     * ========================================
     */
    const action37Result = db
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
        7,
        "Confirm MFSdC process has been implemented",
        "If appropriate",
        20,
        30,
      );

    const action37Id = action37Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 8
     * ========================================
     */
    const action38Result = db
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
        8,
        "Confirm MFSdC process has been implemented",
        "If appropriate",
        20,
        30,
      );

    const action38Id = action38Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 9
     * ========================================
     */
    const action39Result = db
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
        9,
        "Confirm MFSdC process has been implemented",
        "If appropriate",
        20,
        30,
      );

    const action39Id = action39Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 10
     * ========================================
     */
    const action40Result = db
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
        10,
        "Can Train Be Moved",
        "Is there an option to move the train by carrying out a move in the wrong direction?  Do any level crossings need to be staffed to permit the wrong direction movement",
        20,
        30,
      );

    const action40Id = action40Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 11
     * ========================================
     */
    const action41Result = db
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
        11,
        "Other TOC assistance",
        "If no immediate assistance available can another train operator provide assistance more quickly",
        20,
        30,
      );

    const action41Id = action41Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 12
     * ========================================
     */
    const action42Result = db
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
        12,
        "Other Support",
        "Is other support needed on site?  Consider BTP, Land Sherrifs, Additional MOM.  Are evacuation ramps available?",
        20,
        30,
      );

    const action42Id = action42Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 13
     * ========================================
     */
    const action43Result = db
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
        13,
        "Work with TOC/FOC to Amend Train Service",
        "As per contingency plan identifying opportunities and risks to train service upon start of full service",
        20,
        30,
      );

    const action43Id = action43Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 2 Action 14
     * ========================================
     */
    const action44Result = db
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
        14,
        "MFSdD process",
        "Has the MFSdD process been implemented (if appropriate)",
        20,
        30,
      );

    const action44Id = action44Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 3 Action 1
     * ========================================
     */
    const action51Result = db
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
        stage3Id,
        1,
        "Conference with Signallers",
        "SNDM to chair conference with signallers to agree recovery plan",
        30,
        60,
      );

    const action51Id = action51Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 3 Action 2
     * ========================================
     */
    const action52Result = db
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
        stage3Id,
        2,
        "Monitor Milestone Plan",
        "Monitor Milestone Plan against activities",
        30,
        60,
      );

    const action52Id = action52Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 3 Action 3
     * ========================================
     */
    const action53Result = db
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
        stage3Id,
        3,
        "Stranded Trains Risk Assessment",
        "Complete Stranded Trains RA and complete plans A, B and C",
        30,
        60,
      );

    const action53Id = action53Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 3 Action 4
     * ========================================
     */
    const action54Result = db
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
        stage3Id,
        4,
        "Communicate Updated Black, Red, Amber",
        "Communicate updated status to stakeholders based on latest information",
        30,
        60,
      );

    const action54Id = action54Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 3 Action 5
     * ========================================
     */
    const action55Result = db
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
        stage3Id,
        5,
        "Undertake the 11-30 Minutes Cross Check",
        "Undertake the 11-30 Minutes Cross Check",
        30,
        60,
      );

    const action55Id = action55Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 3 Action 6
     * ========================================
     */
    const action56Result = db
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
        stage3Id,
        6,
        "Amend Train Service with TOC/FOC",
        "Work with the TOC/FOC to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service",
        30,
        60,
      );

    const action56Id = action56Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 4 Action 1
     * ========================================
     */
    const action71Result = db
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
        stage4Id,
        1,
        "Oversee Service Recovery",
        "And escalate as necessary",
        30,
        90,
      );

    const action71Id = action71Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 4 Action 2
     * ========================================
     */
    const action72Result = db
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
        stage4Id,
        2,
        "Stranded Trains Log",
        "Copy Stranded Trains Information into CCIL",
        30,
        90,
      );

    const action72Id = action72Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 4 Action 3
     * ========================================
     */
    const action73Result = db
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
        stage4Id,
        3,
        "Oversee TOC Recovery Plan",
        "Oversee TOC Recovery Plan",
        30,
        90,
      );

    const action73Id = action73Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 4 Action 4
     * ========================================
     */
    const action74Result = db
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
        stage4Id,
        4,
        "Declare Service Recovery Complete",
        "Declare Service Recovery Complete",
        30,
        90,
      );

    const action74Id = action74Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 4 Action 5
     * ========================================
     */
    const action75Result = db
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
        stage4Id,
        5,
        "Stranded Trains Log",
        "Copy Stranded Trains Information into CCIL",
        30,
        90,
      );

    const action75Id = action75Result.lastInsertRowid;

    /**
     * ========================================
     * Stage 4 Action 6
     * ========================================
     */
    const action76Result = db
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
        stage4Id,
        6,
        "Support Effected TOCs/FOCs",
        "On the resumption of the train service following disruption",
        30,
        90,
      );

    const action76Id = action76Result.lastInsertRowid;

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

    // STAGE 1 ROLES
    // insertActionRole.run(action1Id, rcmRole.id); can have multiple assigned to the same action
    insertActionRole.run(action1Id, sndmRole.id);
    insertActionRole.run(action2Id, sndmRole.id);
    insertActionRole.run(action3Id, sndmRole.id);
    insertActionRole.run(action4Id, rcmRole.id);
    insertActionRole.run(action5Id, rcmRole.id);
    insertActionRole.run(action6Id, infoControllerRole.id);
    insertActionRole.run(action7Id, infoControllerRole.id);
    insertActionRole.run(action8Id, incidentControllerRole.id);
    insertActionRole.run(action9Id, incidentControllerRole.id);
    insertActionRole.run(action10Id, trainRunningControllerRole.id);
    insertActionRole.run(action11Id, rcmRole.id);
    insertActionRole.run(action12Id, trainRunningControllerRole.id);
    insertActionRole.run(action13Id, trainRunningControllerRole.id);

    // STAGE 2 ROLES
    insertActionRole.run(action31Id, sndmRole.id);
    insertActionRole.run(action32Id, sndmRole.id);
    insertActionRole.run(action33Id, sndmRole.id);
    insertActionRole.run(action34Id, rcmRole.id);
    insertActionRole.run(action35Id, rcmRole.id);
    insertActionRole.run(action36Id, rcmRole.id);
    insertActionRole.run(action37Id, infoControllerRole.id);
    insertActionRole.run(action38Id, infoControllerRole.id);
    insertActionRole.run(action39Id, infoControllerRole.id);
    insertActionRole.run(action40Id, incidentControllerRole.id);
    insertActionRole.run(action41Id, incidentControllerRole.id);
    insertActionRole.run(action42Id, incidentControllerRole.id);
    insertActionRole.run(action43Id, trainRunningControllerRole.id);
    insertActionRole.run(action44Id, trainRunningControllerRole.id);

    // STAGE 3 ROLES
    insertActionRole.run(action51Id, sndmRole.id);
    insertActionRole.run(action52Id, rcmRole.id);
    insertActionRole.run(action53Id, rcmRole.id);
    insertActionRole.run(action54Id, infoControllerRole.id);
    insertActionRole.run(action55Id, infoControllerRole.id);
    insertActionRole.run(action56Id, trainRunningControllerRole.id);

    // STAGE 4 ROLES
    insertActionRole.run(action71Id, sndmRole.id);
    insertActionRole.run(action72Id, sndmRole.id);
    insertActionRole.run(action73Id, rcmRole.id);
    insertActionRole.run(action74Id, rcmRole.id);
    insertActionRole.run(action75Id, rcmRole.id);
    insertActionRole.run(action76Id, trainRunningControllerRole.id);

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
      ps.stage_number,
      ps.name AS stage_name,
      ps.due_from_incident_start AS stage_due_from_incident_start
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
