const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Points Failure",
    "description": "Points Failure affecting rail services.",
    "version": 7,
    "title": "Points Failure Plan",
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
            "title": "Contact S&T Team",
            "description": "S&T Fault team ETA MOM ETA (Can these be sent quicker by train or by using bus lanes?) Understand full impact of failure, lines affected and any trapped trains. Consider whether once on site the S+T are to be requested to secure points before fault finding. What is the best position for the points to be operated to?",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Review IC Brief",
            "description": "Received brief from IC to fully understand the infrastructure restrictions",
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
            "description": "TOC Duty Control Managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR / Freight",
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
            "title": "Review Failure History",
            "description": "Check recent FMS history. Send the PWay if there is an indication that their support may be needed. It may take some time for PWay resources to get to site, so early advice speeds up response. IPS one by one test by signaller to be undertaken in any multiple points failure",
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
            "title": "Request IIT Trace Data",
            "description": "Obtain IIT info on traces and send out details",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "30 second Brief to the TRC / TOC Leads, SNDM & RCM on the Incident. Dispatch team, confirming estimated time of arrival (ETA) to access point; • Confirm expected walking time from access point to site; • Confirm lines required to be blocked (for access, investigation and secure points); and • Liaises with Train Running Controller (TRC).",
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
            "description": "Confirm immediate Tactical plan with IC and TOC control lead. Prepare for escalation if necessary.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "Ensure Control Team and TOC / FOC control teams are fully aware of Incident",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Plan Investigation Window",
            "description": "Identifies and if needed creates a 10-minute window to investigate (plus walking time) within 20-minutes of maintenance team ETA to site. This may include the early termination of services, cancellation of circuits or the holding of services to facilitate the access; • Reviews, agrees, and communicates plan to impacted train operators; and • Confirms arrangements with the shift signalling manager.",
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
            "description": "Does the command structure need to be set up. (If more than 3 stranded trains stand up RIC. Start stranded trains board)",
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
            "description": "Agree with RCM who will cross-check first 10 minutes (Initial response actions completed).",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Review Milestone Plan",
            "description": "Appoint ARM and obtain a milestone plan. (Particulary if its in the Thames Valley area and going to affect AM / PM peak services)",
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
            "description": "Discuss access requirements with ARM, TRC & Signaller. Can the use of drones assist with any examination? Consider whether action to be granted immediately or once train service amended. Ensure length of any line blockage is agreed before being granted.",
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
          }
        ]
      },
      {
        "name": "Planned Response",
        "actions": [
          {
            "title": "Monitor Milestone Plan",
            "description": "Monitor milestone plan against activities",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Share Status Update",
            "description": "Continue to send updated BLACK / RED / AMBER messages based on the information available.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Monitor Milestone Plan",
            "description": "Monitor progress of milestone plan",
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
            "description": "Declare service recovery complete. Upload Stranded Trains risk assessment to CCIL",
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
