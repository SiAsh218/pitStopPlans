const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Lineside Fire",
    description: "Lineside Fire affecting rail services.",
    version: 1,
    title: "Lineside Fire",
    stages: [
      {
        name: "Initial Response",
        actions: [
          {
            title: "Notify NR Senior Leader",
            description:
              "Network Rail Senior Leader / On-call advised (Via WhatsApp Group)",
            roles: ["SNDM"],
          },
          {
            title: "Deploy Responders",
            description:
              "Confirm that correct responders have been sent to site Check that RIO / SIO have been appointed Confirm and Understand immediate tactical plan with the IC Ensure immediate tactical plan understood by Senior TOC Manager and Embedded BTP Inspector",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description: "Confirm the catgory of the Incident Black Red Amber",
            roles: ["Information Controller"],
          },
          {
            title: "Gather Incident Details",
            description:
              "Establish as much detail about the lineside fire as possible: * What lines are affected? * Can trains run at caution past the site? * If a station affected, can trains run but not call. * Are any trains trapped / stranded? * Best access point IF fire on OLE consider controlled stand of all trains before switch off is undertaken",
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
              "TOC Senior Leader / On-Call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp Group)",
            roles: ["SNDM"],
          },
          {
            title: "Notify TOC Managers",
            description:
              "TOC Duty Control Managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR IF fire on OLE consider controlled stand of all trains before switch off is undertaken",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Create Initial BLACK / RED / AMBER Message and inform stakeholders of whats happened, impact, where, when etc.",
            roles: ["Information Controller"],
          },
          {
            title: "Assess Hazardous Materials",
            description:
              "Is there a risk of gas cylinders being involved? Is an exclusion zone likely to be imposed? Are assets affected? If so advise relevant discipline and appoint ARM.19 Any fires or other incidents involving damaged cables or cable troughing (and which cable has been impacted is uncertain), Control are to call Doncaster and report as per the SOP Arrange S&T and D&P tp undertaken inspection of cable route although no failure indications are showing",
            roles: ["Incident Controller"],
          },
          {
            title: "Share Contingency Plan",
            description:
              "Based on the information you have to hand, identify the relevant contingency plan",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Understand immediate tactical plan with RCM, consider standing up formal command structure. If more than 3 stranded trains stand up RIC. Update stranded trains board.",
            roles: ["SNDM"],
          },
          {
            title: "Confirm RIO/SIO Appointment",
            description: "Check that RIO / SIO have been appointed.",
            roles: ["RCM"],
          },
          {
            title: "Consider Drone Survey",
            description: "Can the use of drones help with the examination?",
            roles: ["Incident Controller"],
          },
          {
            title: "Inform Train Operators",
            description:
              "Train Operators have been informed and contingency plan has been implemented:",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm the immediate tactical plan to include milestones with 1. RIC 2. IC 3. SIO / RIO 4. Senior TOC Manager 5. Embedded BTP Inspector",
            roles: ["RCM"],
          },
          {
            title: "Deploy MOM/EIU",
            description:
              "Send MOM / EIU to site. Appoint RIO / SIO Get a photo or use Good sam",
            roles: ["Incident Controller"],
          },
          {
            title: "Protect Adjacent Routes",
            description: "Block on with other routes (if applicable)",
            roles: ["Train Running Controller"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm immediate tactical plan with the RIO / RCM / SIO / TRC",
            roles: ["Incident Controller"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify any stranded trains and understand recovery options.",
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
            title: "Assess Stranded Train Risk",
            description:
              "Complete stranded trains risk assessment and prepare plans A, B and C - In conjunction with the Senior Duty TOC Manager",
            roles: ["RCM"],
          },
          {
            title: "Assign Cross-Check",
            description:
              "Agree with the RCM who will cross-check first 10 mins initial reposnse actions have been completed:",
            roles: ["Information Controller"],
          },
          {
            title: "Agree RIO Timescales",
            description:
              "Agree timescales with RIO for progress updates to be provided.",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work With TOCs / FOCs to amend train service as per contingency plan, idenifying any opportunities and risks to train service upon start up of full service. Crew Implications Unit Implications",
            roles: ["Train Running Controller"],
          },
          {
            title: "Hold Strategic Conference",
            description:
              "Hold strategic conference with the aim of the attendees formalising the tactical plan and reviewing its progression",
            roles: ["SNDM"],
          },
          {
            title: "Assess Incident Impact",
            description:
              "Review route impact and evaluate tactical against operational plan Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            roles: ["RCM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake the cross-check:",
            roles: ["Information Controller"],
          },
          {
            title: "Establish Exclusion Zone",
            description:
              "If a exclusion zone imposed, can it be reduced in anyway? Would a shield train reduce the exclusion zone?",
            roles: ["Incident Controller"],
          },
          {
            title: "Hold Service Conference",
            description: "Train service management conference held at:",
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
            title: "Review Milestone Plan",
            description: "Review tactical plan against milestones with RIO.",
            roles: ["Incident Controller"],
          },
          {
            title: "Notify Incident Teams",
            description: "Check on call staff advised as per the matrix",
            roles: ["SNDM"],
          },
          {
            title: "Brief Control Teams",
            description:
              "Ensure Control Team and Senior TOC / FOC control representatives are fully aware of Incident",
            roles: ["RCM"],
          },
          {
            title: "Manage Stranded Trains",
            description: "Review progress with rescue of stranded trains.",
            roles: ["Incident Controller"],
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
            description:
              "Implement and monitor milestone plan. Advise NOC London (if incident is in the Thames Valley area).",
            roles: ["RCM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake the 11 - 30 mins cross-check",
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
              "Work With TOCs / FOCs to amend train service as per contingency plan, idenifying any opportunities and risks to train service upon start up of full service. Crew implications Unit implications",
            roles: ["Train Running Controller"],
          },
          {
            title: "Assess Escalation Needs",
            description:
              "Consider escalation of incident if incident protracted. Ensure senior industry stakeholders aware. Advise media teams.",
            roles: ["SNDM"],
          },
          {
            title: "Plan Service Resumption",
            description:
              "Prepare for resumption of service or contingency options.",
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
            title: "Monitor Service Recovery",
            description: "Gain Recovery Plan and oversee service recovery.",
            roles: ["RCM"],
          },
          {
            title: "Support Affected Operators",
            description:
              "Support affected TOCs / FOCs on the resumption of the train service following disruption.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Monitor Service Recovery",
            description: "Liaise with TOCs to maximise service recovery.",
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
