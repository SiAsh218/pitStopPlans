const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Axle Counter Failure",
    description: "Axle Counter Failure affecting rail services.",
    version: 1,
    title: "Axle Counter Failure",
    stages: [
      {
        name: "Initial Response",
        actions: [
          {
            title: "Notify NR Senior Leader",
            description:
              "Network Rail senior leader / on-call advised (Via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Deploy Responders",
            description:
              "Confirm that the correct responders have been sent to site. Consider / request the release of controls if applicable",
            roles: ["RCM"],
          },
          {
            title: "Confirm Incident Category",
            description: "Categorisation of incident Black Red Amber",
            roles: ["Information Controller"],
          },
          {
            title: "Confirm Incident Location",
            description:
              "Understand exact location and lines / signals affected. Method of working. Has the failure occured after the passage of a train? First Train affected. S&T Fault team ETA MOM ETA PWay ETA (Can these be sent quicker by train or by using bus lanes?) Consider whether S&T are to be requested to secure points before fault finding once on site.",
            roles: ["Incident Controller"],
          },
          {
            title: "Notify TOC Senior Leader",
            description:
              "TOC senior leader / on-call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Notify TOC Managers",
            description:
              "TOC duty control managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR / Freight",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send initial BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Confirm System Reset",
            description:
              "Has a successful conditional reset being carried out? This should be completed even if a suspected ACE failure. Has the most appropriate method of working been considered. Do we need to implement ESW?",
            roles: ["Incident Controller"],
          },
          {
            title: "Review Milestone Plan",
            description:
              "Appoint ARM and obtain a milestone plan. (Particularly if it's in the Thames Valley area and going to affect AM / PM peak services). When appointing the ARM immediately confirm that they are able to provide technical assistance or whether they need additional support from the Level 2/3/4 on call.",
            roles: ["Incident Controller"],
          },
          {
            title: "Inform Train Operators",
            description:
              "Train operators have been informed and a contingency plan has been implemented.• Identifies and if needed creates a 10-minute window to investigate (plus walking time) within 20-minutes of maintenance team ETA to site. This may include the early termination of services, cancellation of circuits or the holding of services to facilitate the access; • Reviews, agrees, and communicates plan to impacted train operators; and • Confirms arrangements with the shift signalling manager.",
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
              "30 second brief to the TRC / TOC leads and RCM on the incident",
            roles: ["Incident Controller"],
          },
          {
            title: "Review IC Brief",
            description:
              "Received brief from IC to fully understand the infrastructure restrictions:",
            roles: ["Train Running Controller"],
          },
          {
            title: "Manage Stranded Trains",
            description:
              "Are there any stranded trains? Update Stranded Trains board. Stand up RIC if more than three stranded trains.",
            roles: ["SNDM"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify any stranded trains Dispatch team, confirming estimated time of arrival (ETA) to access point; • Confirm expected walking time from access point to site; • Confirm lines required to be blocked (for access, investigation and secure points); and • Liaises with Train Running Controller (TRC).",
            roles: ["Incident Controller"],
          },
          {
            title: "Share Contingency Plan",
            description:
              "Based on the information you have to hand, identify the relevant contingency plan",
            roles: ["Train Running Controller"],
          },
        ],
      },
      {
        name: "Access & Assessment",
        actions: [
          {
            title: "Assign Cross-Check",
            description:
              "Agree with RCM who will cross-check first 10 minutes (Initial response actions completed).",
            roles: ["Information Controller"],
          },
          {
            title: "Plan Access Window",
            description: "Identify an access window to allow S&T time on fault",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start-up of full service.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Hold Service Conference",
            description: "Train service management conference held?",
            roles: ["SNDM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake the cross-check",
            roles: ["Information Controller"],
          },
          {
            title: "Brief Control Teams",
            description:
              "Ensure Control Team and TOC / FOC control teams are fully aware of incident",
            roles: ["Incident Controller"],
          },
          {
            title: "Hold Incident Conference",
            description:
              "Incident management conference held? (Staff called as per on call matrix?)",
            roles: ["SNDM"],
          },
          {
            title: "Hold Team Huddle",
            description:
              "Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
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
            title: "Notify NOC London",
            description:
              "Advise NOC London (if incident in Thames Valley area)",
            roles: ["RCM"],
          },
          {
            title: "Identify Axle Counter",
            description:
              "What type of axle counter is it? Does the fault team have spare components on the van?",
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
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Assess Support Needs",
            description:
              "Are other disciplines needed to help solve the fault? (Such as telecoms, E&P), have they been called, what is their ETA?",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start-up of full service.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Complete 11-30 Check",
            description: "Undertake the 11-30 minutes cross-check.",
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
              "Support affected TOCs / FOCs on the resumption of the train service following disruption",
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
            description: "Upload stranded trains risk assessment to CCIL",
            roles: ["RCM"],
          },
        ],
      },
    ],
  });
};
