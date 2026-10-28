const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Security Incident",
    description: "Security Incident affecting rail services.",
    version: 1,
    title: "Security Incident",
    stages: [
      {
        name: "Initial Response",
        actions: [
          {
            title: "Confirm Tactical Plan",
            description:
              "Understand immediate tactical plan with RCM, consider standing up formal command structure. If more than 3 stranded trains stand up RIC. Update stranded traisn board.",
            roles: ["SNDM"],
          },
          {
            title: "Deploy Responders",
            description:
              "Confirm that correct responders have been despaitch to site. Confirm HOT procedure has been carried out. Confirm BTP have catorgrised the incident and incident is being treated appropiately Check that RIO / SIO have been appointed. Confirm and understand immediate tactical plan with the IC. Ensure immediate tactical plan understood by senior TOC manager and Embedded BTP Inspector",
            roles: ["RCM"],
          },
          {
            title: "Categorisation of incident BLACK",
            description:
              "Categorisation of incident BLACK / RED / AMBER Create Initial BLACK / RED /AMBER Message and inform stakeholders of whats happened, impact, where, when etc.",
            roles: ["Information Controller"],
          },
          {
            title: "Gather Incident Details",
            description:
              "Establish as much detail about the security incident as possible. Has the HOT procedure been completed? Have the BTP catorgarised the incident (Cat 1 or Cat 2)? If a telephone threat, use Telephone Threat Form.",
            roles: ["Incident Controller"],
          },
          {
            title: "Share Contingency Plan",
            description:
              "Based on the information you have to hand, identify the relevant contingency plan",
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
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Assess Station Options",
            description:
              "If on a train at a station, can other services call or has the station been closed. Can trains run but not call? Can the use of drones assist with any examination?",
            roles: ["Incident Controller"],
          },
          {
            title: "Inform Train Operators",
            description:
              "Train Operators have been informed and contingency plan has been implemented.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify stranded trains and consider recovery options.",
            roles: ["RCM"],
          },
          {
            title: "Plan Safe Evacuation",
            description:
              "If on a train, establish where the train ran run to safely evacuate the passengers.",
            roles: ["Incident Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm immediate tactical plan with IC and TOC control lead. Prepare for escalation if necessary.",
            roles: ["RCM"],
          },
          {
            title: "Deploy MOM/EIU",
            description: "Send MOM / EIU to site. Appoint RIO / SIO",
            roles: ["Incident Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm immediate tactical plan with the RIO / RCM / SIO / TRC Identify stranded trains and consider recovery options.",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Access & Assessment",
        actions: [
          {
            title: "Assess Incident Impact",
            description:
              "Review route and potential wider industry impact. Declare working strategy.",
            roles: ["SNDM"],
          },
          {
            title: "Locate Stranded Passengers",
            description:
              "Identify any stranded passenger trains and complete risk assessment. Ensure plans A, B & C are in place for affected services. Ensure IC and all other affected parties aware of the plans.",
            roles: ["RCM"],
          },
          {
            title: "Assign Cross-Check",
            description:
              "Agree with RCM who will cross-check first 10 minutes. (Initial response actions completed).",
            roles: ["Information Controller"],
          },
          {
            title: "Review Milestone Plan",
            description: "Review tactical plan against milestones with RIO.",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Review Incident Severity",
            description:
              "Consider if incident sits at the right level within BTP and escalate to Duty Inspector if necessary",
            roles: ["SNDM"],
          },
          {
            title: "Notify NOC London",
            description:
              "Advise NOC London (if incident in Thames Valley Area).",
            roles: ["RCM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake the cross-check",
            roles: ["Information Controller"],
          },
          {
            title: "Review Recovery Progress",
            description:
              "Everything going to plan? If not, re-visit milestone plan Escalate where necessary?",
            roles: ["Incident Controller"],
          },
          {
            title: "Hold Strategic Conference",
            description:
              "Hold Srategic conference. with the aim of the attendees formalising the tactical plan and reviewing its progression.",
            roles: ["SNDM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Hold Service Conference",
            description:
              "Train Service Management Conference held. Check on call staff advised as per the matrix",
            roles: ["SNDM"],
          },
          {
            title: "Hold Team Huddle",
            description:
              "Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            roles: ["RCM"],
          },
        ],
      },
      {
        name: "Planned Response",
        actions: [
          {
            title: "Review Tactical Plan",
            description:
              "Continue to review the tactical plan against estimated milestones.",
            roles: ["SNDM"],
          },
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
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Assess Escalation Needs",
            description:
              "Consider escalation of incident if incident protracted.",
            roles: ["SNDM"],
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
          {
            title: "Brief Industry Leaders",
            description:
              "Ensure Senior industry stakeholders and media teams aware.",
            roles: ["SNDM"],
          },
        ],
      },
      {
        name: "Service Recovery",
        actions: [
          {
            title: "Monitor Service Recovery",
            description:
              "Oversee progress with service recovery an escalate if necessary",
            roles: ["SNDM"],
          },
          {
            title: "Monitor TOC Recovery",
            description: "Oversee TOC recovery plan.",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Update BLACK / RED /AMBER messages with recovery progress to achieve full right time running.",
            roles: ["Information Controller"],
          },
          {
            title: "Support Affected Operators",
            description:
              "Support affected TOCs / FOCs on the resumption of the train service following disruption",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Service Recovery",
            description: "Declare Service Recovery complete.",
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
