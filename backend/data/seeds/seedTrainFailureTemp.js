const db = require("../db.js");

function seedTrainFailureTemplate(adminUser) {
  console.log("🌱 Seeding incident plan train failure...");

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
      "Train Failure",
      "A train failure affecting rail services.",
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
      "Train Failure",
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
    .run(templateId, 2, "Access & Assessment", 30);

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
    .run(templateId, 3, "Response Planning", 60);

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
      "Notify NR Senior Leader",
      "Notify the on-call Network Rail senior leader of the incident and its impact.",
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
      "Notify TOC Senior Leader",
      "Notify the on-call TOC senior leader of the incident and its impact.",
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
      "Deploy Responders",
      "Send the appropriate responders to assess the incident and its impact.",
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
      "Notify TOC Duty Manager",
      "Notify the TOC Duty Control Manager of the incident.",
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
      "Agree Tactical Plan",
      "Agree the plan with the IC and TOC control lead; prepare to escalate if needed.",
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
      "Confirm Incident Category",
      "Confirm the incident category.",
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
      "Share Initial Status",
      "Share the initial Black, Red or Amber status with stakeholders.",
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
      "Gather Incident Details",
      "Gather key details about the incident.",
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
      "Confirm Failure Details",
      "Confirm fitters are dispatched and their ETA; identify suitable assistance and its ETA.",
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
      "Confirm Failure with IC",
      "Confirm the failure details with the IC and agree recovery arrangements with the TOC.",
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
      "Agree Immediate Plan",
      "Agree the immediate tactical plan and prepare to escalate if needed.",
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
      "Select Contingency Plan",
      "Select the relevant plan using the available information.",
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
      "Share TOC Contingency Plan",
      "Tell train operators which contingency plan is being used.",
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
      "Establish Command Structure",
      "Establish a command structure if required.",
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
      "Train Service Conference",
      "Hold a Train Service Management Conference if required.",
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
      "Hold the conference with staff on the on-call matrix.",
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
      "Notify NOC",
      "Notify NOC for incidents in the Thames Valley area.",
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
      "Hold IC/TRC Huddles",
      "After tactical or strategic conferences, share decisions and situational updates with IC and TRC teams; record them in CCIL.",
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
      "Confirm MFSdC Process",
      "Confirm the MFSdC process is in place, if required.",
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
      "Confirm MFSdC Process",
      "Confirm the MFSdC process is in place, if required.",
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
      "Verify MFSdC Process",
      "Confirm the MFSdC process is in place, if required.",
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
      "Check MFSdC Process",
      "Confirm the MFSdC process is in place, if required.",
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
      "Assess Wrong-Direction Move",
      "Can the train move in the wrong direction? Identify any level crossings that need staffing.",
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
      "Seek Other TOC Assistance",
      "If help is not immediately available, check whether another operator can respond sooner.",
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
      "Arrange Additional Support",
      "Assess the need for BTP, Land Sheriffs, an additional MOM or evacuation ramps.",
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
      "Work with the TOC/FOC to apply the contingency plan and assess risks when full service resumes.",
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
      "Confirm MFSdD Process",
      "Confirm the MFSdD process is in place, if required.",
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
      "Agree Recovery Plan",
      "SNDM to chair a conference with signallers and agree the recovery plan.",
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
      "Track progress against the milestone plan.",
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
      "Assess Stranded Trains",
      "Complete the stranded-train risk assessment and plans A, B and C.",
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
      "Share Updated Status",
      "Share the latest Black, Red or Amber status with stakeholders.",
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
      "Complete 11-30 Minute Cross-Check",
      "Complete the 11-30 minute cross-check.",
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
      "Amend Train Service",
      "Work with the TOC/FOC to apply the contingency plan and assess risks when full service resumes.",
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
      "Monitor recovery and escalate if needed.",
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
      "Update Stranded Train Log",
      "Record stranded-train details in CCIL.",
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
      "Oversee TOC Recovery",
      "Monitor the TOC recovery plan.",
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
      "Confirm Service Recovery",
      "Confirm service recovery is complete.",
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
      "Update Stranded Train Log",
      "Record stranded-train details in CCIL.",
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
      "Support Affected TOCs/FOCs",
      "Support operators as train services resume.",
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

  console.log("✅ Incident plan train failure seeded");
}

module.exports = seedTrainFailureTemplate;
