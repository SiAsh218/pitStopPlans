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
      "NR Senior Leader Advised",
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
   * Stage 1 Action 3
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
      "Responders to site",
      "The correct responders have been sent to site to assess the incident and its potential impact.",
      10,
      10,
    );

  const action3Id = action3Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 1 Action 4
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
   * Stage 1 Action 5
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
      "ADD Activation Impact",
      "Understand the full impact of the ADD sctivation.  Lines, limits of section affected and has there been a tripping?",
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
      "ADD Activation Cause",
      "Can the TOC identify the cause of the ADD activation, is it a train fault?",
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
      "Rapid Brief",
      "30 second brief to the TRC/TOC leads, SNDM & RCM on the incident",
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
      "Stranded Trains",
      "Identify any stranded trains and consider recovery options",
      10,
      10,
    );

  const action11Id = action11Result.lastInsertRowid;

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
      "IC Brief",
      "Recieved brief from IC to fully understand the infrastructure restrictions",
      10,
      10,
    );

  const action13Id = action13Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 1 Action 14
   * ========================================
   */
  const action14Result = db
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
      14,
      "Contingency Plan",
      "Identify the relevant contingency plan based on the information gathered to this point",
      10,
      10,
    );

  const action14Id = action14Result.lastInsertRowid;

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
      "Command Structure",
      "Does the command structure need setting up",
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
      "Service Management Conference",
      "Train Service Management Conference held?",
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
      "Incident Management Conference held as per staff on call matrix",
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
      "Stranded Trains RA",
      "Complete Stranded Trains Risk Assessment and prepare plans A, B and C",
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
      "Dynamic Risk Assessment",
      "Consider the use of a dynamic risk assessment.  If the incident is in the Thames Valley advise NOC London",
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
      "Huddles",
      "Following Tactical/Strategic conferences huddles with IC and TRC teams to be undertaken to provide details of decisions and create a shared situational awareness",
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
      "Agree Cross Check",
      "Agree with RCM who will cross check the first 10 minutes",
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
      "Cross Check",
      "Carry Out cross check of the first 10 minutes",
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
      "Communicate Status",
      "Send updated Black, Red, Amber to stakeholders on latest information",
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
      "Appoint ARM",
      "If OLE Damage and request milestone plane",
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
      "Access",
      "Consider Access requirements with signaller and ARM/MOM/OLE team",
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
      "Coast",
      "If able to coast are coasting boards being resourced.  ETA to site",
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
      "Amend Train Service",
      "Work with TOC/FOC to amend the train service as per contingency plan identifying opportunities and risks to train service upon start up of full service",
      20,
      30,
    );

  const action43Id = action43Result.lastInsertRowid;

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
      "Tyrell",
      "Continue to update Tyrell/Amber messages based on the information available",
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
      "Stranded Trains",
      "Update the stranded trains board where applicable.  Stand up RIC if more than 3 stranded trains",
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
      "Re-energising Timeline",
      "Understand the timeline and process for re-energising the OLE",
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
      "Milestone Plan",
      "Develop a milestone recovery train service plan for each train through the affected area after recovery of the OLE (if applicable)",
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
      "Stranded Trains",
      "Monitor Stranded Train management against the Risk Assessment",
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
      "11-30 min Check",
      "Undertake the 11-30 minutes cross check",
      30,
      60,
    );

  const action56Id = action56Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 3 Action 7
   * ========================================
   */
  const action57Result = db
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
      7,
      "Milestone Plan",
      "Develop a milestone recovery train service plan for each train through the affected area after recovery of the OLE (if applicable)",
      30,
      60,
    );

  const action57Id = action57Result.lastInsertRowid;

  /**
   * ========================================
   * Stage 3 Action 8
   * ========================================
   */
  const action58Result = db
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
      8,
      "Amend Train Service",
      "Work with TOC/FOC to amend the train service as per contingency plan identifying opportunities and risks to train service upon start up of full service",
      30,
      60,
    );

  const action58Id = action58Result.lastInsertRowid;

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
      "Service Recovery",
      "Oversee progress with service recovery and escalate as necessary",
      60,
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
    .run(stage4Id, 2, "TOC Recovery Plan", "Oversee TOC Recovery Plan", 60, 90);

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
      "Service Recovered",
      "Declare service recovery complete",
      60,
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
      "Support Effected TOCs/FOCs",
      "On the resumption of the train service following disruption",
      60,
      90,
    );

  const action74Id = action74Result.lastInsertRowid;

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
  insertActionRole.run(action3Id, rcmRole.id);
  insertActionRole.run(action4Id, rcmRole.id);
  insertActionRole.run(action5Id, rcmRole.id);
  insertActionRole.run(action6Id, infoControllerRole.id);
  insertActionRole.run(action7Id, infoControllerRole.id);
  insertActionRole.run(action8Id, incidentControllerRole.id);
  insertActionRole.run(action9Id, incidentControllerRole.id);
  insertActionRole.run(action10Id, incidentControllerRole.id);
  insertActionRole.run(action11Id, incidentControllerRole.id);
  insertActionRole.run(action13Id, trainRunningControllerRole.id);
  insertActionRole.run(action14Id, trainRunningControllerRole.id);

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

  // STAGE 3 ROLES

  insertActionRole.run(action51Id, infoControllerRole.id);
  insertActionRole.run(action52Id, sndmRole.id);
  insertActionRole.run(action53Id, sndmRole.id);
  insertActionRole.run(action54Id, rcmRole.id);
  insertActionRole.run(action55Id, rcmRole.id);
  insertActionRole.run(action56Id, infoControllerRole.id);
  insertActionRole.run(action57Id, incidentControllerRole.id);
  insertActionRole.run(action58Id, trainRunningControllerRole.id);

  // STAGE 4 ROLES
  insertActionRole.run(action71Id, sndmRole.id);
  insertActionRole.run(action72Id, rcmRole.id);
  insertActionRole.run(action73Id, rcmRole.id);
  insertActionRole.run(action74Id, trainRunningControllerRole.id);

  console.log("✅ Incident plan ADD Activation seeded");
}

module.exports = seedAddActivationTemplate;
