const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Signalling System Failure",
    description: "Signalling System Failure affecting rail services.",
    version: 1,
    title: "Signalling System Failure",
    stages: [
      {
        name: "Initial Response",
        actions: [
          {
            title: "Notify NR Senior Leader",
            description:
              "Network Rail Senior Leader / on-call advised (Via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Deploy Responders",
            description:
              "Confirm that the correct responders have been sent to site.",
            roles: ["RCM"],
          },
          {
            title: "Confirm Incident Category",
            description: "Categorisation of Incident Black Red Amber",
            roles: ["Information Controller"],
          },
          {
            title: "Assess Incident Impact",
            description:
              "Understand full extent of the failure and what is affected. Is failure intermittent or constant? Limits of degraded working. S&T Fault team ETA MOM ETA Telecoms ETA (Can these be sent quicker by train or by using bus lanes?) Consider whether once on site the S+T are to be requested to secure points before fault finding.",
            roles: ["Incident Controller"],
          },
          {
            title: "Review IC Brief",
            description:
              "Received brief from IC to fully understand the infrastructure restrictions. If on Barnstaple line make train ammendments if pilot working is implemented if will not wor otherwise",
            roles: ["Train Running Controller"],
          },
          {
            title: "Notify TOC Senior Leader",
            description:
              "TOC Senior Leader / on-call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Notify TOC Managers",
            description:
              "TOC Duty Control Managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR / Freight",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send initial BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Assess Stranded Trains",
            description:
              "Are any trains trapped / stranded: What is the method of working? Options for degraded working. Talking by signals / ESW / TBW / SLW / working by pilot. Advise Level 1 LOM. E&P ETA (650v supply affected) Telecoms advised and ETA. FTN or fibre optic cable will definately need telecoms attendance Additional resources needed - Off area MOMs / LOM / PWay to clip points.",
            roles: ["Incident Controller"],
          },
          {
            title: "Share Contingency Plan",
            description:
              "Based on the information you have to hand, identify the relevant contingency plan",
            roles: ["Train Running Controller"],
          },
          {
            title: "Review Milestone Plan",
            description:
              "Appoint ARM and obtain a milestone plan. (Particulary if it's in the Thames Valley area and going to affect AM / PM peak services)",
            roles: ["Incident Controller"],
          },
          {
            title: "Inform Train Operators",
            description:
              "Train operators have been informed and contingency plan has been implemented.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm immediate tactical plan with IC and TOC control lead. Prepare for escalation if necessary.",
            roles: ["RCM"],
          },
          {
            title: "Brief Control Teams",
            description:
              "30 second brief to the TRC / TOC leads and RCM on the incident Dispatch team, confirming estimated time of arrival (ETA) to access point; • Confirm expected walking time from access point to site; • Confirm lines required to be blocked (for access, investigation and secure points); and • Liaises with Train Running Controller (TRC).",
            roles: ["Incident Controller"],
          },
          {
            title: "Plan Access Window",
            description:
              "• Identifies and if needed creates a 10-minute window to investigate (plus walking time) within 20-minutes of maintenance team ETA to site. This may include the early termination of services, cancellation of circuits or the holding of services to facilitate the access; • Reviews, agrees, and communicates plan to impacted train operators; and • Confirms arrangements with the shift signalling manager.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify stranded trains and consider recovery options.",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Access & Assessment",
        actions: [
          {
            title: "Establish Command Structure",
            description: "Does the command structure need to be set up.",
            roles: ["SNDM"],
          },
          {
            title: "Assess Stranded Train Risk",
            description:
              "Complete stranded train risk assessment and prepare plans A, B & C.",
            roles: ["RCM"],
          },
          {
            title: "Assign Cross-Check",
            description:
              "Agree with RCM who will cross-check first 10 minutes (initial response actions completed).",
            roles: ["Information Controller"],
          },
          {
            title: "Plan Access Window",
            description:
              "Identify an access window to allow S&T time on fault. How long is needed / available? Do we need to create a margin? Do not allow S+T to take an open ended line block.",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Hold Service Conference",
            description: "Train service Management Conference held?",
            roles: ["SNDM"],
          },
          {
            title: "Hold Team Huddle",
            description:
              "Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            roles: ["RCM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake the cross-check.",
            roles: ["Information Controller"],
          },
          {
            title: "Brief Control Teams",
            description:
              "Ensure control team and TOC / FOC control teams are fully aware of incident",
            roles: ["Incident Controller"],
          },
          {
            title: "Hold Incident Conference",
            description:
              "Incident Management Conference held? (Staff called as per on call Matrix?)",
            roles: ["SNDM"],
          },
          {
            title: "Notify NOC London",
            description:
              "Advise NOC London (If incident in Thames Valley Area).",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Consult BOX/CCT",
            description: "Ask BOX TO or CCT for any assistance in diagnosis.",
            roles: ["Incident Controller"],
          },
          {
            title: "Assess Support Needs",
            description:
              "Are other disciplines needed to help solve the fault (such as Telecoms, E&P), have they been called, what is their ETA?",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Planned Response",
        actions: [
          {
            title: "Monitor Milestone Plan",
            description: "Monitor milestone plan against activities",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available.",
            roles: ["Information Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Monitor Stranded Trains",
            description:
              "Monitor stranded train management against the risk assessment.",
            roles: ["RCM"],
          },
          {
            title: "Complete 11-30 Check",
            description: "Carry out the 11-30 minutes cross-check.",
            roles: ["Information Controller"],
          },
          {
            title: "Contact RAM Team",
            description: "Is support needed from the RAM team?",
            roles: ["Incident Controller"],
          },
          {
            title: "Arrange Route Support",
            description: "Do we need support from adjacent routes?",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Service Recovery",
        actions: [
          {
            title: "Monitor Service Recovery",
            description:
              "Oversee progress with service recovery and escalate if necessary",
            roles: ["SNDM"],
          },
          {
            title: "Monitor TOC Recovery",
            description: "Oversee TOC recovery plan.",
            roles: ["RCM"],
          },
          {
            title: "Support Affected Operators",
            description:
              "Support affected TOCs / FOCs on the resumption of the train service following disruption.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Service Recovery",
            description: "Declare service recovery complete.",
            roles: ["RCM"],
          },
          {
            title: "Update Stranded Train Board",
            description:
              "If stranded trains board used, photograph and upload to CCIL.",
            roles: ["SNDM"],
          },
          {
            title: "Assess Stranded Train Risk",
            description: "Upload Stranded Trains risk assessment to CCIL",
            roles: ["RCM"],
          },
        ],
      },
    ],
  });
};
