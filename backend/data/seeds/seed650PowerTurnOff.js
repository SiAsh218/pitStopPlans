const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "650 Power Turn Off",
    "description": "650 Power Turn Off affecting rail services.",
    "version": 1,
    "title": "650 Power Turn Off",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Notify NR Senior Leader",
            "description": "Network Rail Senior Leader / on-call advised (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Deploy Responders",
            "description": "Confirm that the correct responders have been sent to site.",
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
            "title": "Assess Incident Impact",
            "description": "Understand full impact of the tripping. Lines/section affected, has it been possible to recharge, any trapped trains in the section? Confirm method of working with signaller and ECRO. Can Diesel / Bi mode trains run? Is it possible to coast through the affected section? MOM / OLE team ETA (Can these be sent quicker by train or by using bus lanes?) For trees touching OLE call Off Track",
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
            "title": "Notify TOC Senior Leader",
            "description": "TOC Senior Leader / on-call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Notify TOC Managers",
            "description": "TOC Duty Control Managers advised: MTR / GWR / XC / Hex / Freight / Chiltern / SWR / Freight",
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
            "title": "Check ADD Activation",
            "description": "Has there been an ADD activation (see separate Pit Stop Plan for ADD activation)? Can any remote equipment help narrow down the location / cause of the tripping? Both on train and remote. If a train in the section is there any damage to the pantograph? Is TOC mobilising fitters? Has the train lost line light? Are there any trees in the vicinity (known areas for branches in OLE)? Can the use of drones assist with the OLE examination.",
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
            "title": "Arrange Off-Track Support",
            "description": "Do we need off track assistance (consider mobilising and stand down if not needed)? Is there a T3 possession on the adjacent lines? Are the work sites being contacted?",
            "roles": [
              "Incident Controller"
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
            "title": "Confirm Tactical Plan",
            "description": "Confirm immediate tactical plan with IC and TOC control lead. Prepare for escalation if necessary.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "30 second brief to the TRC / TOC Leads, SNDM & RCM on the incident. Ensure Control Team and TOC / FOC control teams are fully aware of Incident",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Identify Stranded Trains",
            "description": "Identify stranded trains and consider recovery options.",
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
            "title": "Establish Command Structure",
            "description": "Does the command structure need to be set up? If more than 3 stranded trains stand up RIC. Update stranded trains board.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Train Risk",
            "description": "Complete stranded train risk assessment and prepare plans A, B & C.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Assign Cross-Check",
            "description": "Agree with RCM who will cross-check the first 10 minutes. (Initial response actions completed).",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Appoint ARM",
            "description": "Appoint ARM (if OLE damage) and request milestone plan.",
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
            "title": "Hold Service Conference",
            "description": "Train service Management Conference held?",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Hold Team Huddle",
            "description": "Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Complete Cross-Check",
            "description": "Undertake the cross-check",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Plan Site Access",
            "description": "Consider access requirements with signaller and ARM / MOM / OLE team",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Hold Incident Conference",
            "description": "Incident Management Conference held? (Staff called as per on call matrix?)",
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
            "title": "Resource Coasting Boards",
            "description": "If able to coast, are coasting boards being resourced? ETA to site.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Assess Coasting Feasibility",
            "description": "Can coasting be considered? Be clear of emergency switch off limits OLE staff and ECRO need to agree block",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm Safe Clearance",
            "description": "Clear limited agreed with ECRO and OLE staff",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Plan Train Rescue",
            "description": "Can any units be used to rescue from branch lines",
            "roles": [
              "Train Running Controller"
            ]
          }
        ]
      },
      {
        "name": "Planned Response",
        "actions": [
          {
            "title": "Create Milestone Plan",
            "description": "Develop a milestone recovery train service plan for each train through the affected area after restortation of the OLE.",
            "roles": [
              "RCM",
              "Incident Controller"
            ]
          },
          {
            "title": "Update Amber Messages",
            "description": "Continue to send updated Tyrell / Amber messages based on the information available.",
            "roles": [
              "Information Controller"
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
            "title": "Plan OLE Re-energisation",
            "description": "Understand timeline and process for re-energising the OLE following any switch off.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Stranded Trains",
            "description": "Monitor stranded train management against the risk assessment.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Complete 11-30 Check",
            "description": "Undertake the 11-30 minutes cross-check.",
            "roles": [
              "Information Controller"
            ]
          }
        ]
      },
      {
        "name": "Service Recovery",
        "actions": [
          {
            "title": "Monitor Service Recovery",
            "description": "Oversee progress with service recovery and escalate if necessary",
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
            "title": "Update Stranded Train Board",
            "description": "If stranded trains board used, photograph and upload to CCIL.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm Service Recovery",
            "description": "Declare Service Recovery complete. Upload Stranded Trains risk assessment to CCIL",
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
