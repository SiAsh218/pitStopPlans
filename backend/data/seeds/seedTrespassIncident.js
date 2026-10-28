const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Trespass Incident",
    description: "Trespass Incident affecting rail services.",
    version: 1,
    title: "Trespass Incident",
    stages: [
      {
        name: "Initial Response",
        actions: [
          {
            title: "Notify NR Senior Leader",
            description:
              "Network Rail Senior Leader / On-call advised (via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Deploy Responders",
            description:
              "Confirm that Correct responders have been sent to site Inform embedded BTP Inspector Inform NOC",
            roles: ["RCM"],
          },
          {
            title: "Confirm Incident Category",
            description: "Confirm the catgory of the Incident Black Red Amber",
            roles: ["Information Controller"],
          },
          {
            title: "Appoint RIO",
            description:
              "Contact MOM, Appoint as RIO if significant incident, despatch to site - request ETA: Ascertain lines blocked and whether trains are running normally on adjacent lines.",
            roles: ["Incident Controller"],
          },
          {
            title: "Review IC Brief",
            description:
              "Received brief from IC to fully understand the infratructure restrictions",
            roles: ["Train Running Controller"],
          },
          {
            title: "Notify TOC Senior Leader",
            description:
              "TOC Senior Leader / On-Call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Notify TOC Managers",
            description:
              "TOC Duty Control Managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR",
            roles: ["RCM"],
          },
          {
            title: "Send Initial Update",
            description:
              "Create initial BLACK / RED / AMBER Message and inform stakeholders of whats happened, impact, where, when etc.",
            roles: ["Information Controller"],
          },
          {
            title: "Confirm EIU ETA",
            description:
              "Contact EIU, obtain ETA and send to site. Use of EDDY - Exact Location Direction of travel, Detailed description, Youth? Advise BTP and send to site.",
            roles: ["Incident Controller"],
          },
          {
            title: "Share Contingency Plan",
            description:
              "Based on the information you have to hand, identify the relevant contingency plan",
            roles: ["Train Running Controller"],
          },
          {
            title: "Assess Incident Impact",
            description:
              "Consider the impact of the incident based on initial information. Should RIC be stood up? (If more than 3 starnded trains stand up RIC) Update Stranded Trains Board",
            roles: ["SNDM"],
          },
          {
            title: "Confirm Driver Welfare",
            description:
              "Confirm Competent Person for Driver Welfare via the TOC",
            roles: ["RCM"],
          },
          {
            title: "Contact BTP Officer",
            description:
              "Utliise the embedded BTP Officer. Consider if the use of drones can assist with any examination.",
            roles: ["Incident Controller"],
          },
          {
            title: "Inform Train Operators",
            description:
              "Train operators have been informed and contingency plan has been implemented:",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm the immediate tactical plan to include milestones with 1. RIC 2. IC 3. SIO / RIO 4. Senior TOC Manager 5. Embedded BTP Inspector",
            roles: ["RCM"],
          },
          {
            title: "Brief Control Teams",
            description:
              "30 second brief to the TRC / TOC Leads and RCM on the incident.",
            roles: ["Incident Controller"],
          },
          {
            title: "Protect Adjacent Routes",
            description: "Block on with other routes (if applicable)",
            roles: ["Train Running Controller"],
          },
          {
            title: "Request TOLO Relief",
            description:
              "Request a TOLO / Relief Driver & Rolling Stock Technician to attend site (if applicable, i.e if train has struck something) - Request ETA Consider: can another TOC dispatch a fitter faster to assist?",
            roles: ["Incident Controller"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify any stranded trains and understand recovery options",
            roles: ["RCM"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify Stranded trains and understand recovery option.",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Access & Assessment",
        actions: [
          {
            title: "Notify Incident Teams",
            description:
              "Media - on-call advised (significant disruption / incident likely to have media interest / reputational damage)",
            roles: ["SNDM"],
          },
          {
            title: "Assess Stranded Train Risk",
            description:
              "Complete stranded trains risk assessment and prepare plans A, B and C - In conjunction with the Senior Duty TOC Manager",
            roles: ["RCM"],
          },
          {
            title: "Assign Cross-Check",
            description:
              "Agree with the RCM who will cross-check first 10mins initial reposnse actions have been completed:",
            roles: ["Information Controller"],
          },
          {
            title: "Repair Damaged Fencing",
            description:
              "Are off - track attending to repair damaged fencing? Has the RIO inspected the fence line?",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work With TOCs / FOCs to ammend train service as per contingency plan, idenifying any opprotunites and risks to train service upon start up of full service. Crew Implications Unit Implications",
            roles: ["Train Running Controller"],
          },
          {
            title: "Hold Service Conference",
            description: "Train service management conference held at:",
            roles: ["SNDM"],
          },
          {
            title: "Assess Incident Impact",
            description:
              "Review route impact and evaluate tactical against operational plan. Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            roles: ["RCM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake cross-check:",
            roles: ["Information Controller"],
          },
          {
            title: "Review Logging Prompts",
            description:
              "Consider all the additional prompts mentioned in the CCIL logging template section",
            roles: ["Incident Controller"],
          },
          {
            title: "Hold Incident Conference",
            description: "Incident management conference held at:",
            roles: ["SNDM"],
          },
          {
            title: "Review Logging Prompts",
            description:
              "Consider the Additional Prompts mentioned in the CCIL logging template",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Check On-Call Staff",
            description:
              "Check On call staff have been advised as per the matrix:",
            roles: ["SNDM"],
          },
          {
            title: "Brief Control Teams",
            description:
              "Ensure Control Team and Senior TOC / FOC control representatives are fully aware of Incident. Advise NOC London (if in Thames Valley Area)",
            roles: ["RCM"],
          },
        ],
      },
      {
        name: "Planned Response",
        actions: [
          {
            title: "Review Incident Progress",
            description:
              "Is the incident going to plan, is there anything that needs to be escalated for further support with the incident Could we improve the situation by viewing body cam footage / CCTV?",
            roles: ["SNDM"],
          },
          {
            title: "Monitor Milestone Plan",
            description: "Implement and monitor milestone plan",
            roles: ["RCM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake the 11 - 30 mins cross-check",
            roles: ["Information Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work With TOCS / FOCS to ammend train service as per contingency plan, idenifying any opprotunites and risks to train service upon start up of full service. Crew implications Unit implications",
            roles: ["Train Running Controller"],
          },
          {
            title: "Hold Control Conference",
            description:
              "Consider further service management conferences / incident management conferences if required",
            roles: ["SNDM"],
          },
          {
            title: "Plan Service Resumption",
            description:
              "Prepare for resumption of service or contingency options",
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
        name: "Service Recovery",
        actions: [
          {
            title: "Record Lessons Learned",
            description: "Capture learnings / findings.",
            roles: ["SNDM"],
          },
          {
            title: "Oversee Recovery Plan",
            description: "Gain recovery plan and oversee service recovery",
            roles: ["RCM"],
          },
          {
            title: "Support Affected Operators",
            description:
              "Support affected TOCs / FOCs on the resumption of the train service following disruption",
            roles: ["Train Running Controller"],
          },
          {
            title: "Share Status Update",
            description:
              "Consider whether trauma support required for any Control Staff",
            roles: ["SNDM"],
          },
          {
            title: "Coordinate TOC Recovery",
            description: "Liaise with TOCs to maximise service recovery",
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
