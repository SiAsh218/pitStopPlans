const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Weather Flooding Incident",
    "description": "Weather Flooding Incident affecting rail services.",
    "version": 1,
    "title": "Weather Flooding Incident Plan",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Notify NR Senior Leader",
            "description": "Network Rail Senior Leader / On-call advised (via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Deploy Responders",
            "description": "Confirm that Correct responders have been sent to site Inform NOC",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Share Status Update",
            "description": "Confirm the catgory of the Incident Black Red Amber",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Confirm Incident Location",
            "description": "Confirm exact location, (ETHANE) which lines are blocked, height of water agianst rail, is water flowing fast enough to dislodge ballast? Or pooling water? Method of working - normal working, caution or blocked Any trapped or stranded trains ? withdraw can you reversible work or single line working Can normal working resume without pway inspection yes if SBSI allows or control permission Get Photos",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Review IC Brief",
            "description": "Received brief from IC to fully understand the infratructure restrictions",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Notify TOC Senior Leader",
            "description": "TOC Senior Leader / On-Call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Notify TOC Managers",
            "description": "TOC Duty Control Managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Share Status Update",
            "description": "Create initial BLACK / RED / AMBER Message and inform stakeholders of whats happened, impact, where, when etc.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Confirm Response ETA",
            "description": "Contact reponse team and estbalish eta",
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
            "title": "Assess Incident Impact",
            "description": "Consider the impact of the incident based on initial information. Should RIC be stood up? (If more than 3 starnded trains stand up RIC) Update Stranded Trains Board",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Review Camera Footage",
            "description": "Utliise any remote cameras for footage available Consider if the use of drones can assist with any examination.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Inform Train Operators",
            "description": "Train operators have been informed and contingency plan has been implemented:",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Confirm Tactical Plan",
            "description": "Confirm the immediate tactical plan to include milestones with 1. RIC 2. IC 3. SIO / RIO 4. Delivery Unit response staff 5. Enviornment Agency",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "30 second brief to the TRC / TOC Leads and RCM on the incident.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Protect Adjacent Routes",
            "description": "Block on with other routes (if applicable)",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Measure Flood Depth",
            "description": "Establish height of water - below rail head = normal working Up to bottom of rail head = normal working,Water level is above bottom of the rail but not the rail head = Max speed 5mph, Water level above rail head = 5mph.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Identify Stranded Trains",
            "description": "Identify any stranded trains and understand recovery options",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Follow Operational Advice",
            "description": "1 Following advice from the signaller to the Route Operations Control that train running has been suspended due to flood water being above the top of the rail head, operational staff may be requested to attend to establish the depth of the water. 12.2 If the water is up to the top of the rail head, Route Operations Control may authorise trains to travel through the flood water at a maximum speed of 5 mph. 12.3 Where flood water is above the top of the railhead or flood water is moving at any depth and is likely to dislodge or has dislodged ballast, Route Operations Control shall only authorise train movements through the flood water if the following conditions have been met: • The track and formation have been inspected by track maintenance or engineering staff and they have confirmed that it is safe for trains to travel through the affected area. • Where the flood water is above the bottom of the rail head the movement is authorised at a maximum speed of 5 mph. • Where the flood water is more than 100mm above the top of the rail the movement is permitted by the train operator.",
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
            "title": "Notify Incident Teams",
            "description": "Media - on-call advised (significant disruption / incident likely to have media interest / reputational damage)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Train Risk",
            "description": "Complete stranded trains risk assessment and prepare plans A, B and C - In conjunction with the Senior Duty TOC Manager",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Assign Cross-Check",
            "description": "Agree with the RCM who will cross-check first 10mins initial reposnse actions have been completed:",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Identify Stranded Trains",
            "description": "Identify Stranded trains and understand recovery option.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work With TOCs / FOCs to ammend train service as per contingency plan, idenifying any opprotunites and risks to train service upon start up of full service. Crew Implications Unit Implications",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Hold Service Conference",
            "description": "Train service management conference held at:",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Incident Impact",
            "description": "Review route impact and evaluate tactical against operational plan. Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Complete Cross-Check",
            "description": "Undertake cross-check:",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Confirm Off-Track Attendance",
            "description": "Are off - track attending ?",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Hold Incident Conference",
            "description": "Incident management conference held at:",
            "roles": [
              "SNDM"
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
            "title": "Check On-Call Staff",
            "description": "Check On call staff have been advised as per the matrix:",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "Ensure Control Team and Senior TOC / FOC control representatives are fully aware of Incident. Advise NOC London (if in Thames Valley Area)",
            "roles": [
              "RCM"
            ]
          }
        ]
      },
      {
        "name": "Planned Response",
        "actions": [
          {
            "title": "Review Incident Progress",
            "description": "Is the incident going to plan, is there anything that needs to be escalated for further support with the incident Could we improve the situation by viewing body cam footage / CCTV? Remote cameras",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Milestone Plan",
            "description": "Implement and monitor milestone plan",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Complete Cross-Check",
            "description": "Undertake the 11 - 30 mins cross-check",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work With TOCS / FOCS to ammend train service as per contingency plan, idenifying any opprotunites and risks to train service upon start up of full service. Crew implications Unit implications",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Hold Control Conference",
            "description": "Consider further service management conferences / incident management conferences if required",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Plan Service Resumption",
            "description": "Prepare for resumption of service or contingency options",
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
        "name": "Service Recovery",
        "actions": [
          {
            "title": "Record Lessons Learned",
            "description": "Capture learnings / findings. Add Pitt stop to log and WhatsApp",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Service Recovery",
            "description": "Gain recovery plan and oversee service recovery",
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
            "title": "Confirm Operational Plan",
            "description": "Ops should decide what would be most advantageous to open first, then second and so on, and communicate this to local S&T teams. If it is dependent on the day, then should be in a recovery plan to hold a teleconference with ops and S&T team to agree order in which to prioritise re-opening.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Service Recovery",
            "description": "Liaise with TOCs to maximise service recovery",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Plan Route Proving",
            "description": "a) Which route is being proved (inc direction)? Does route need to be proved in both directions? b) Which train requested to route prove? c) When will the route proving be carried out (special considerations nighttime, snow etc)? This might mean that we need to allocate more than 1 driver to the train to complete route proving. d) Distance to be route proved. This is again around the length of time which a driver will be required to proceed at caution. Low speed moves for prolonged distances are fatiguing for drivers and again we may need more than 1 driver. e) Will the route proving take place utilising an ECS or passenger service? Consideration of the risk of stranded train if an obstruction is encountered.",
            "roles": [
              "Incident Controller"
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
            "title": "Conduct Welfare Checks",
            "description": "Carry out welfare checks on your control team Upload Stranded Trains risk assessment to CCIL",
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
