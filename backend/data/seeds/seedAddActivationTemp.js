const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "ADD Activation",
    "description": "An ADD activation affecting rail services.",
    "version": 1,
    "title": "ADD Activation",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Notify NR Senior Leader",
            "description": "Notify the on-call Network Rail senior leader of the incident and its impact.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Notify TOC Senior Leader",
            "description": "Notify the on-call TOC senior leader of the incident and its impact.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Deploy Responders",
            "description": "Send the appropriate responders to assess the incident and its impact.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Notify TOC Duty Manager",
            "description": "Notify the TOC Duty Control Manager of the incident.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Agree Tactical Plan",
            "description": "Agree the plan with the IC and TOC control lead; prepare to escalate if needed.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Confirm Incident Category",
            "description": "Confirm the incident category.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Share Initial Status",
            "description": "Share the initial Black, Red or Amber status with stakeholders.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Assess ADD Activation Impact",
            "description": "Identify affected lines and section limits, and confirm whether a trip occurred.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Identify ADD Activation Cause",
            "description": "Ask the TOC to identify the cause and whether a train fault is involved.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Brief Incident Leads",
            "description": "Brief TRC/TOC leads, SNDM and RCM within 30 seconds.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Assess Stranded Trains",
            "description": "Identify stranded trains and assess recovery options.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Get IC Brief",
            "description": "Obtain the IC's briefing on infrastructure restrictions.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Select Contingency Plan",
            "description": "Select the relevant plan using the information gathered.",
            "roles": [
              "Train Running Controller"
            ]
          }
        ]
      },
      {
        "name": "Access & Assessment",
        "actions": [
          {
            "title": "Establish Command Structure",
            "description": "Establish a command structure if required.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Train Service Conference",
            "description": "Hold a Train Service Management Conference if required.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Incident Management Conference",
            "description": "Hold the conference with staff on the on-call matrix.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Trains",
            "description": "Complete the stranded-train risk assessment and plans A, B and C.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Dynamic Risk Assessment",
            "description": "Consider a dynamic risk assessment; notify NOC London for Thames Valley incidents.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Hold IC/TRC Huddles",
            "description": "After tactical or strategic conferences, share decisions and situational updates with IC and TRC teams.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Assign First 10-Minute Check",
            "description": "Agree with RCM who will cross-check the first 10 minutes.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Complete First 10-Minute Check",
            "description": "Cross-check the first 10 minutes.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Share Updated Status",
            "description": "Share the latest Black, Red or Amber status with stakeholders.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Appoint ARM",
            "description": "If OLE is damaged, appoint an ARM and request a milestone plan.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Arrange Access",
            "description": "Agree access requirements with the signaller and ARM/MOM/OLE team.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Arrange Coasting Boards",
            "description": "If the train can coast, arrange coasting boards and confirm their ETA.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with the TOC/FOC to apply the contingency plan and assess risks when full service resumes.",
            "roles": [
              "Train Running Controller"
            ]
          }
        ]
      },
      {
        "name": "Response Planning",
        "actions": [
          {
            "title": "Update Tyrell/Amber Messages",
            "description": "Update Tyrell/Amber messages with the latest information.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Update Stranded Train Board",
            "description": "Update the board; establish RIC if more than three trains are stranded.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm Re-energisation Plan",
            "description": "Confirm the OLE re-energisation timeline and process.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Create Recovery Milestone Plan",
            "description": "Plan each train's recovery through the affected area after OLE recovery, if applicable.",
            "roles": [
              "RCM",
              "Incident Controller"
            ]
          },
          {
            "title": "Monitor Stranded Trains",
            "description": "Track stranded-train management against the risk assessment.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Complete 11-30 Minute Cross-Check",
            "description": "Complete the 11-30 minute cross-check.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with the TOC/FOC to apply the contingency plan and assess risks when full service resumes.",
            "roles": [
              "Train Running Controller"
            ]
          }
        ]
      },
      {
        "name": "Recovery",
        "actions": [
          {
            "title": "Oversee Service Recovery",
            "description": "Monitor recovery and escalate if needed.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "TOC Recovery Plan",
            "description": "Oversee TOC Recovery Plan",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Confirm Service Recovery",
            "description": "Confirm service recovery is complete.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Support Affected TOCs/FOCs",
            "description": "Support operators as train services resume.",
            "roles": [
              "Train Running Controller"
            ]
          }
        ]
      }
    ]
  });
};
