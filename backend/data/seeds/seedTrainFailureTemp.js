const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Train Failure",
    "description": "A train failure affecting rail services.",
    "version": 1,
    "title": "Train Failure",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Notify NR Senior Leader",
            "description": "Notify the on-call Network Rail senior leader of the incident and its impact.",
            "roles": [
              "RCM",
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
              "SNDM"
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
            "title": "Gather Incident Details",
            "description": "Gather key details about the incident.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Confirm Failure Details",
            "description": "Confirm fitters are dispatched and their ETA; identify suitable assistance and its ETA.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Confirm Failure with IC",
            "description": "Confirm the failure details with the IC and agree recovery arrangements with the TOC.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Agree Immediate Plan",
            "description": "Agree the immediate tactical plan and prepare to escalate if needed.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Select Contingency Plan",
            "description": "Select the relevant plan using the available information.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Share TOC Contingency Plan",
            "description": "Tell train operators which contingency plan is being used.",
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
            "title": "Notify NOC",
            "description": "Notify NOC for incidents in the Thames Valley area.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Hold IC/TRC Huddles",
            "description": "After tactical or strategic conferences, share decisions and situational updates with IC and TRC teams; record them in CCIL.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Confirm MFSdC Process",
            "description": "Confirm the MFSdC process is in place, if required.",
            "roles": [
              "RCM",
              "Information Controller"
            ]
          },
          {
            "title": "Verify MFSdC Process",
            "description": "Confirm the MFSdC process is in place, if required.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Check MFSdC Process",
            "description": "Confirm the MFSdC process is in place, if required.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Assess Wrong-Direction Move",
            "description": "Can the train move in the wrong direction? Identify any level crossings that need staffing.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Seek Other TOC Assistance",
            "description": "If help is not immediately available, check whether another operator can respond sooner.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Arrange Additional Support",
            "description": "Assess the need for BTP, Land Sheriffs, an additional MOM or evacuation ramps.",
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
          },
          {
            "title": "Confirm MFSdD Process",
            "description": "Confirm the MFSdD process is in place, if required.",
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
            "title": "Agree Recovery Plan",
            "description": "SNDM to chair a conference with signallers and agree the recovery plan.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Milestone Plan",
            "description": "Track progress against the milestone plan.",
            "roles": [
              "RCM"
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
            "title": "Share Updated Status",
            "description": "Share the latest Black, Red or Amber status with stakeholders.",
            "roles": [
              "Information Controller"
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
            "title": "Update Stranded Train Log",
            "description": "Record stranded-train details in CCIL.",
            "roles": [
              "SNDM",
              "RCM"
            ]
          },
          {
            "title": "Oversee TOC Recovery",
            "description": "Monitor the TOC recovery plan.",
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
