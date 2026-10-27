const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Bridge Strike",
    "description": "Bridge Strike affecting rail services.",
    "version": 4,
    "title": "Bridge Strike",
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
            "title": "Notify TOC Managers",
            "description": "Confirm that the correct responders have been sent to site. TOC duty control managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR / Freight",
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
            "title": "Confirm Incident Location",
            "description": "Understand the location of the bridge, the bridge number and the road / lines affected. Any people trapped in the vehicle, is it on fire or is it carrying dangerous goods? Any trapped or stranded trains? When did the bridge strike occur? If in the past check how many trains have passed over the bridge in each direction / on each line since the report. Can the late advice instructions be applied? Obtain contact details of person who reported the strike. (Do this if reported directly or via a third party such as the NR Helpline). The above applies to whoever takes the initial call reporting the bridge strike",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Review IC Brief",
            "description": "Received brief from IC to fully understand the infrastructure restrictions: Based on the information you have to hand, identify the relevant contingency plan",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Notify TOC Senior Leader",
            "description": "TOC senior leader / on-call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm Tactical Plan",
            "description": "Confirm immediate Tactical plan with IC and TOC control lead. Prepare for escalation if necessary",
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
            "title": "Assess Bridge Damage",
            "description": "Category of the bridge? (green / double amber / amber / red) If a late reported bridge strike, how many trains have passed over in each direction since the report? Does LV (light vehicle) restrictions apply? Is the bridge formed of more than one independant structure? From what direction was the vehicle travelling in? MOM (BSN) ETA ETA for bridge strike examiner (BSE)",
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
          }
        ]
      },
      {
        "name": "Access & Assessment",
        "actions": [
          {
            "title": "Establish Command Structure",
            "description": "Does the command structure need to be set up? Train service management conference held Are there any stranded trains? Update Stranded Trains board. Stand up RIC if more than three stranded trains.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Milestone Plan",
            "description": "Monitor milestone plan against activities. Advise NOC London (if incident in Thames Valley Area).",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Assign Cross-Check",
            "description": "Agree with RCM who will cross-check first 10 minutes (Initial response actions completed). Carry out the cross-check.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Notify Incident Teams",
            "description": "BTP / civil police advised. If there are stranded trains, how many people are affected. Are any vunerable? Are any photos available / CCTV Coverage?",
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
            "description": "Incident Management Conference held? (Staff called as per on call matrix?)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Train Risk",
            "description": "Complete stranded risk assessment and complete plans A, B and C. Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
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
            "title": "Share Status Update",
            "description": "If BSE required and response time is likley to be protracted can dispensation be granted remotely (BSE reviewing footge provided by the BSN)? Record BSN time to site on CCIL.",
            "roles": [
              "Incident Controller"
            ]
          }
        ]
      },
      {
        "name": "Planned Response",
        "actions": [
          {
            "title": "Check Site Signage",
            "description": "Is all signage in good order? Advise Highways Agency (via structures) if there is any damage to signage.",
            "roles": [
              "Incident Controller"
            ]
          }
        ]
      },
      {
        "name": "Service Recovery",
        "actions": [
          {
            "title": "Monitor Service Recovery",
            "description": "Oversee progress with service recovery an escalate if necessary",
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
            "description": "Declare service recovery complete.",
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
