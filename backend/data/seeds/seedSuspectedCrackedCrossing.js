const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Suspected Cracked Crossing",
    "description": "Suspected Cracked Crossing affecting rail services.",
    "version": 1,
    "title": "Suspected Cracked Crossing",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Notify NR Senior Leader",
            "description": "Network Rail senior leader / on-call advised (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Deploy Responders",
            "description": "Confirm that the correct responders have been sent to site. If there are concerns around the wording used by the driver check voice comms.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Confirm Incident Category",
            "description": "Categorisation of Incident Black Red Amber",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Confirm Track Location",
            "description": "Understand from P/way the location of the defect with as much detail as possible. If at a station or other landmark be clear if the report is in advance of or in rear of the location. Use flow chart in NOP 3.07.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Review IC Brief",
            "description": "Received brief from IC to fully understand the infrastructure restrictions:",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Capture Track Evidence",
            "description": "Can the P/way take a photo of defect and send to Control.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Notify TOC Managers",
            "description": "TOC Duty Control Managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR / Freight",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Share Status Update",
            "description": "Send initial BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Check Line Blockage",
            "description": "If the line has been blocked, are there any stranded passenger trains.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "30 second brief to the TRC / TOC leads and RCM on the incident",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Share Contingency Plan",
            "description": "Based on the information you have to hand, identify the relevant contingency plan",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Confirm Tactical Plan",
            "description": "Confirm immediate Tactical plan with IC and TOC control lead. Prepare for escalation if necessary.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Inform Train Operators",
            "description": "Train Operators have been informed and contingency plan has been implemented.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Escalate Crossing Defect Assessment",
            "description": "If required escalate to maintenance L4 as per on call matrix. Contact on call RAM (Send photo from the P/way) to discuss can the speed be raised - involve RAM for dispenstation",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Assess Line Condition",
            "description": "Examination of the line carried out - what actions are required Appoint ARM and obtain a milestone plan. (Particularly if in Thames Valley area).",
            "roles": [
              "Incident Controller"
            ]
          }
        ]
      },
      {
        "name": "Access & Assessment",
        "actions": [
          {
            "title": "Manage Stranded Trains",
            "description": "Are there any stranded trains? Update stranded trains board. Stand up RIC if more than three stranded trains.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Train Risk",
            "description": "Complete stranded risk assessment and complete plans A, B and C.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Hold Service Conference",
            "description": "Train service Management Conference held?",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Hold Team Huddle",
            "description": "following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "Ensure Control Team and TOC / FOC control teams are fully aware of incident",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Hold Incident Conference",
            "description": "Incident Management Conference held? (Staff called as per on call matrix?) involve ODM and ECRO is access required?",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Notify NOC London",
            "description": "Advise NOC London (if incident in Thames Valley Area).",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Share Status Update",
            "description": "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Request Camera Footage",
            "description": "Request FFC footage from the TOC / FOC who has reported the suspected track defect.",
            "roles": [
              "SNDM"
            ]
          }
        ]
      },
      {
        "name": "Planned Response",
        "actions": [
          {
            "title": "Assess Defect Repair",
            "description": "Can defect be clamped ? Impose EROS boards",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Milestone Plan",
            "description": "Monitor milestone plan against activities - where is nearest crossing spare?",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Share Status Update",
            "description": "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Review Access Window",
            "description": "Following the initial access window what have the P.Way reported? Is more access required to carry out a repair. How long is needed? Can an ESR be imposed. (Is it better to impose an ESR rather than have an extended line blockage?). P/way to priorities boarding the speed if defect is found overnight. ATP chipping as per new instruction Obtain update from ARM. Do the P.Way have ESR boards avaiable? Can another team bring them to site? Is infra controller aware? Are there issues around the design of the speed?",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with TOC / FOCs to ammend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Plan Crossing Repair Works",
            "description": "Programme of delivery of works required",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Train Risk",
            "description": "Review stranded trains risk assessment (if applicable)",
            "roles": [
              "RCM"
            ]
          }
        ]
      },
      {
        "name": "Service Recovery",
        "actions": [
          {
            "title": "Monitor Service Recovery",
            "description": "Oversee progress with service recovery an escalate if necessary.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor TOC Recovery",
            "description": "Oversee TOC recovery plan.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Support Affected Operators",
            "description": "Support affected TOCs / FOCs on the resumption of the train service following disruption",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Confirm Service Recovery",
            "description": "Declare Service Recovery complete.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Update Stranded Train Board",
            "description": "If stranded trains board used, photograph and upload to CCIL.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Train Risk",
            "description": "Upload Stranded Trains risk assessment to CCIL",
            "roles": [
              "RCM"
            ]
          }
        ]
      }
    ]
  }
  );
};
