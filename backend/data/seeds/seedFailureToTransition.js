const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Failure to Transition",
    description: "Failure to Transition affecting rail services.",
    version: 1,
    title: "Failure to Transition",
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
              "Confirm that the correct responders have been sent to site.",
            roles: ["RCM"],
          },
          {
            title: "Confirm Incident Category",
            description: "Categorisation of Incident Black Red Amber",
            roles: ["Information Controller"],
          },
          {
            title: "Confirm Train Details",
            description:
              "Obtain details of the train that has failed to transition from the signaller (including unit numbers). Pass relevant information to TRC / TOC Enter the information into FMS and raise a fault number.",
            roles: ["Incident Controller"],
          },
          {
            title: "Receive IC Brief",
            description:
              "Receive information from the IC as to the nature of the failure.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Share Status Update",
            description:
              "Send initial BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Share Incident Details",
            description:
              "Provide details of the incident to the Box TO at TVSC to check whether the systems are functioning correctly If the Box TO confirms that there is a fault, advise Stoke TEC to investigate and reset the system as required.",
            roles: ["Incident Controller"],
          },
          {
            title: "Select Train Response",
            description:
              "Based on the information you have to hand, identify the action to be taken with the train service.",
            roles: ["Train Running Controller"],
          },
        ],
      },
      {
        name: "Access & Assessment",
        actions: [
          {
            title: "Notify TOC Senior Leader",
            description: "TOC senior leader / on-call advised",
            roles: ["SNDM"],
          },
          {
            title: "Notify TOC Managers",
            description:
              "TOC Duty Control Managers advised (if system fails to reset and trains continue to be disruptive)",
            roles: ["RCM"],
          },
          {
            title: "Assign Cross-Check",
            description:
              "Agree with RCM who will cross-check first 10 minutes (Initial response actions completed).",
            roles: ["Information Controller"],
          },
          {
            title: "Confirm System Reset",
            description:
              "If system resets, trains should be able to run normally. If system does not reset, obtain eta for Telecoms and estimate for restoration",
            roles: ["Incident Controller"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake the cross-check",
            roles: ["Information Controller"],
          },
          {
            title: "Update Control Teams",
            description: "Update TRC and affected TOCs",
            roles: ["Incident Controller"],
          },
          {
            title: "Apply Contingency Plan",
            description:
              "If system is still a failure, consider wether a contingency plan is required and implement.",
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
            title: "Confirm Telecoms Response",
            description:
              "Review Telecoms attendance and request milestone plan. Appoint ARM if necessary.",
            roles: ["Incident Controller"],
          },
          {
            title: "Manage Stranded Trains",
            description:
              "Are there any stranded trains? Update stranded trains board. Stand up RIC if more than three stranded trains.",
            roles: ["SNDM"],
          },
        ],
      },
      {
        name: "Planned Response",
        actions: [
          {
            title: "Review Repair Plan",
            description:
              "Review failure rectification plan and escalate if necessary.",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Review Repair Plan",
            description: "Review failure rectification plan with Telecoms",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Advise NOC London",
            description: "Advise NOC London",
            roles: ["RCM"],
          },
        ],
      },
      {
        name: "Service Recovery",
        actions: [
          {
            title: "Support Affected Operators",
            description:
              "Support affected TOCs / FOCs on the resumption of the train service following disruption",
            roles: ["Train Running Controller"],
          },
          {
            title: "Update Stranded Train Board",
            description:
              "If stranded trains board used, photograph and upload to CCIL.",
            roles: ["SNDM"],
          },
        ],
      },
    ],
  });
};
