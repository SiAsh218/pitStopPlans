const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    name: "Person Struck by Train",
    description: "Person Struck by Train affecting rail services.",
    version: 1,
    title: "Person Struck by Train",
    stages: [
      {
        name: "Initial Response",
        actions: [
          {
            title: "Notify NR Senior Leader",
            description:
              "Network Rail Senior Leader / On-call advised (Via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Deploy Responders",
            description:
              "Confirm that correct responders have been sent to site",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description: "Confirm the catgory of the incident Black Red Amber",
            roles: ["Information Controller"],
          },
          {
            title: "Mobilise Emergency Services",
            description:
              "Advise: consider access point for size of vehicles attending BTP Ambulance Civil Police (via BTP) Fire Brigade (If aplplicable) Land Sherriffs",
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
              "TOC Senior Leader / On-Call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp group)",
            roles: ["SNDM"],
          },
          {
            title: "Notify NOC London",
            description:
              "Inform the NOC and confirm that Dignity and the Ground Force clean up team are despatched at the same time. Confirm Ground Force at the same time as Dignity. The NOC must call them but check that they have been called and obtain eta.",
            roles: ["RCM"],
          },
          {
            title: "Appoint RIO",
            description:
              "Contact MOM, appoint as RIO despatch to site - request ETA Consider additional MOM if avalible/required - one for impact site and 1 for train. If at station that is unmanned close the station with BTP and or MOM/MIO/ON call staff",
            roles: ["Incident Controller"],
          },
          {
            title: "Share Contingency Plan",
            description:
              "Based on the information you have to hand, identify the relevant contingency plan.",
            roles: ["Train Running Controller"],
          },
          {
            title: "Establish Command Structure",
            description:
              "Does the command structure need to be set up? (If more than 3 stranded trains stand up RIC and start stranded trains board).",
            roles: ["SNDM"],
          },
          {
            title: "Confirm Driver Welfare",
            description:
              "Confirm competent person for driver welfare via the TOC",
            roles: ["RCM"],
          },
          {
            title: "Contact EIU Team",
            description:
              "Contact EIU if applicable and despatch to site - request ETA Utliise the embedded BTP Officer If emergency services arrive beofre RIO and they request access refer to NOP 4.10 section 7.2 to facilitate ths",
            roles: ["Incident Controller"],
          },
          {
            title: "Inform Train Operators",
            description:
              "Train operators have been informed and contingency plan has been implomented at:",
            roles: ["Train Running Controller"],
          },
          {
            title: "Record Station Closure",
            description:
              "Time platform or station closed ensure this is logged in CCIL",
            roles: ["SNDM"],
          },
          {
            title: "Confirm Tactical Plan",
            description:
              "Confirm the immediate tactical plan to include milestones with: 1. RIC 2. IC 3. SIO / RIO see NOP 4.10 section 7.2 4. Senior TOC Manager 5. Embedded BTP Inspector",
            roles: ["RCM"],
          },
          {
            title: "Brief Control Teams",
            description:
              "30 second brief to the TRC / TOC Leads and RCM on the incident. Request FFCCTV from TOC/FOC for BTP gather evidence",
            roles: ["Incident Controller"],
          },
          {
            title: "Protect Adjacent Routes",
            description: "Block on with other routes",
            roles: ["Train Running Controller"],
          },
          {
            title: "Notify TOC Managers",
            description:
              "TOC Duty Control Managers advised: MTR / GWR / XC / HEx / Freight / Chiltern / SWR",
            roles: ["RCM"],
          },
          {
            title: "Request TOLO Relief",
            description:
              "Request a TOLO / Relief Driver & Rolling Stock Technician to attend site - Request ETA Consider - Can Another TOC dispatch a fitter faster to assist?",
            roles: ["Incident Controller"],
          },
          {
            title: "Manage Train Blockage",
            description: "Block on trains",
            roles: ["Train Running Controller"],
          },
          {
            title: "Identify Stranded Trains",
            description:
              "Identify stranded trains and understand recovery options, brief Senior TOC manager on operational restrictions caused by incident.",
            roles: ["Incident Controller"],
          },
          {
            title: "Manage Stranded Trains",
            description: "Stranded trains / formulate a plan - work with TVSC",
            roles: ["Train Running Controller"],
          },
        ],
      },
      {
        name: "Access & Assessment",
        actions: [
          {
            title: "Notify Incident Teams",
            description: "Media - on-call advised (Homicide or unexpected)",
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
            title: "Confirm Recovery Time",
            description:
              "At the earliest opportuinity confirm with the RIO that the train has power and can be moved when necessary. Can the use of drones assist with any examination?",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOCs / FOCs to amend train service as per contingency plan, idenifying any opportunities and risks to train service upon start up of full service.",
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
              "Review route impact and evaluate tactical against operational plan",
            roles: ["RCM"],
          },
          {
            title: "Complete Cross-Check",
            description: "Undertake cross-check:",
            roles: ["Information Controller"],
          },
          {
            title: "Contact BTP Hotline",
            description:
              "Driver contacted BTP fatality hotline - confirmed by TVSC",
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
              "Consider the additional prompts mentioned in the CCIL logging template. Advise NOC London (if incident in Thames Valley Area).",
            roles: ["RCM"],
          },
          {
            title: "Share Status Update",
            description:
              "Send updated BLACK / RED/ AMBER to stakeholders based on latest information currently available:",
            roles: ["Information Controller"],
          },
          {
            title: "Confirm Incident Category",
            description:
              "Police categorisation of incident confirmed: Homicide Unexpected Death Investigated Unexpected Death under investigation",
            roles: ["Incident Controller"],
          },
          {
            title: "Check On-Call Staff",
            description:
              "Check on-call staff have been advised as per the matrix:",
            roles: ["SNDM"],
          },
          {
            title: "Hold Team Huddle",
            description:
              "Following tactical/ strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            roles: ["RCM"],
          },
          {
            title: "Plan Body Recovery",
            description:
              "Is the body complicated to recover - what are your options? Consider - Can the body be covered to allow train movements?",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Planned Response",
        actions: [
          {
            title: "Review Incident Progress",
            description:
              "Is the incident going to plan, is there anything that needs to be escalated for further support with the incident",
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
            title: "Assess Train Rescue",
            description:
              "Could a train be used to shield scene and allow movements on other lines Consider running fast if lines reopen before station fully cleaned",
            roles: ["Incident Controller"],
          },
          {
            title: "Amend Train Service",
            description:
              "Work with TOCs / FOCs to amend train service as per contingency plan, idenifying any opportunities and risks to train service upon start up of full service. Crew implications Unit implications",
            roles: ["Train Running Controller"],
          },
          {
            title: "Hold Control Conference",
            description:
              "consider further service management conferences / incident management conferences if required",
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
          {
            title: "Contact On-Call Support",
            description:
              "Contact on-call and arrange for welfare and duty of care calls for staff attending and dealing with the incident",
            roles: ["Incident Controller"],
          },
        ],
      },
      {
        name: "Service Recovery",
        actions: [
          {
            title: "Record Lessons Learned",
            description:
              "Capture learnings / findings. Consider whether trauma support required for any control staff",
            roles: ["SNDM"],
          },
          {
            title: "Review Milestone Plan",
            description: "Gain milestone plan and oversee service recovery",
            roles: ["RCM"],
          },
          {
            title: "Check Samaritans Signage",
            description: "MOM to check Samaritans signage",
            roles: ["Incident Controller"],
          },
          {
            title: "Support Affected Operators",
            description:
              "Support affected TOCs / FOCs on the resumption of the train service following disruption",
            roles: ["Train Running Controller"],
          },
          {
            title: "Record Station Reopening",
            description:
              "Time platform or station opened ensure this is logged in CCIL",
            roles: ["SNDM"],
          },
          {
            title: "Monitor Service Recovery",
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
