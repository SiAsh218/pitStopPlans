const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Possession Overrun",
    description: "Possession Overrun affecting rail services.",
    version: 1,
    title: "Possession Overrun",
    stages: [
      {
        name: "Initial Response",
        actions: [
          {
            title: "Notify NR Senior Leader",
            description:
              "Network Rail senior leader / On-call advised (Via WhatsApp Group)",
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
            title: "Assess Possession Overrun",
            description:
              "Establish limit and impact of the overrun and immediate priorities Inform ODM, appoint ARM (if applicable), dispatch any additional staff immediately required. Escalate to maintenance, operations and capital delivery on call structure.",
            roles: ["Infrastructure Controller"],
          },
          {
            title: "Dispatch Maintenance Staff",
            description:
              "Dispatch Maintenance staff as directed by the Infrastructure Controller , based on the circumstances of the overrun.",
            roles: ["Incident Controller"],
          },
          {
            title: "Review IC Brief",
            description:
              "Received brief from IC to fully understand the infrastructure restrictions:",
            roles: ["Train Running Controller"],
          },
          {
            title: "Notify TOC Senior Leader",
            description:
              "TOC Senior Leader / On-Call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp Group)",
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
            title: "Identify Possession Recovery Options",
            description:
              "Explore all options to reduce the impact of the overrun: - Is it possible to shorten back the possession / isolation? - Could the possession be lifted and replaced by a line blockage for the remaining activities to be completed? - Can the possession be given up around a train? -Could the possession be given up with an ESR?",
            roles: ["Infrastructure Controller"],
          },
          {
            title: "Deploy Operational Staff",
            description:
              "If Operational staff required to assist, dispatch staff as directed by the Infrastructure Controller",
            roles: ["Incident Controller"],
          },
          {
            title: "Share Contingency Plan",
            description:
              "Based on the information you have to hand, identify the relevant contingency plan",
            roles: ["Train Running Controller"],
          },
          {
            title: "Inform Train Operators",
            description:
              "Train Operators have been informed and contingency plan has been implemented.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm immediate Tactical plan with IC and TOC control lead. Prepare for escalation if necessary.",
            roles: ["RCM"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify stranded trains and develop recovery options.",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Access & Assessment",
        actions: [
          {
            title: "Establish Command Structure",
            description:
              "Does the command structure need to be set up? If more than 3 stranded trains stand up RIC.",
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
              "Agree with RCM who will cross-check first 10 minutes. (Initial response actions completed).",
            roles: ["Information Controller"],
          },
          {
            title: "Brief Control Teams",
            description:
              "Ensure Control Team and TOC / FOC control teams are fully aware of incident",
            roles: ["Infrastructure Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOCs / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
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
            description: "Undertake the cross-check",
            roles: ["Information Controller"],
          },
          {
            title: "Create Milestone Plan",
            description: "Request milestone plan from ODM / ARM",
            roles: ["Infrastructure Controller"],
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
              "Advise NOC London (If Incident in Thames Valley Area).",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
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
            title: "Monitor Overrun Progress",
            description:
              "Review progress of overrun against the milestone plan.",
            roles: ["Infrastructure Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to ammend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
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
            description: "Undertake the 11-30 minutes cross-check.",
            roles: ["Information Controller"],
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
            title: "Conduct Welfare Checks",
            description:
              "Carry out welfare checks on your control team Upload Stranded Trains risk assessment to CCIL",
            roles: ["RCM"],
          },
        ],
      },
    ],
  });
};
