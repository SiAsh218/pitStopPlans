const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Signalling Irregularities WSF",
    "description": "Signalling Irregularities WSF affecting rail services.",
    "version": 2,
    "title": "Signalling Irregularities WSF Plan",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Notify NR Senior Leader",
            "description": "Network Rail Senior Leader / On-call advised (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Deploy Responders",
            "description": "Confirm that correct responders have been sent to site",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Share Status Update",
            "description": "Confirm the catgory of the incident Black Red Amber",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Gather Incident Details",
            "description": "Obtain full details of the incident. Is the incident a Signal Passed at Danger (SPAD) or Signal Passed at Red (SPAR)? If a SPAD has the driver made any allegation against the signalling or railheads? Obtain FFCCTV from operator and drivers report before they bookoff shift call on call Have any points or other assets been damaged as a result of the incident? Immediately advise the TOC or FOC who operates the train. Send MOM to site to gather evidence (including taking photographs as per NOP). Advise S+T (even if the driver has admitted a SPAD). Appoint a NR Investigating Officer advise on call",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Review IC Brief",
            "description": "Received brief from IC to fully understand the infratructure restrictions (if any).",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Notify TOC Senior Leader",
            "description": "TOC Senior Leader / On-Call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Notify NOC London",
            "description": "Advise the NOC. For a SPAD, understand from the NOC if the signal is a multi spad signal.",
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
            "title": "Share Contingency Plan",
            "description": "Based on the information you have to hand, identify the relevant contingency plan.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Establish Command Structure",
            "description": "Does the command structure need to be set up? (If more than 3 stranded trains stand up RIC and start stranded trains board).",
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
            "title": "Review Train Footage",
            "description": "Does the train have Forward Facing Cameras and can the footage be downloaded to aid the investigation. Are there any other cameras (such as CCTV on stations) that will aid the investigation?",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Inform Train Operators",
            "description": "Train operators have been informed and contingency plan has been implomented at:",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Protect Adjacent Routes",
            "description": "Block on with other routes",
            "roles": [
              "Train Running Controller"
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
            "title": "Appoint ARM",
            "description": "Apoint an ARM if significant infrastructure damage or testing likely to be required.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Identify Stranded Trains",
            "description": "Identify stranded trains and understand recovery options, brief Senior TOC manager on operational restrictions caused by incident.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Manage Stranded Trains",
            "description": "Stranded trains / formulate a plan - work with TVSC",
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
            "title": "Hold Service Conference",
            "description": "Train service management conference held at:",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Complete Initial CAT",
            "description": "If a SPAD, complete the initial CAT A SPAD form. If the incident is disputed by the driver, ensure that a phone conference is set up between the Investigating Officers for NR Ops, Maintenance & the TOC / FOC to discuss the allegation and agree initial actions.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Assign Cross-Check",
            "description": "Agree with the RCM who will cross-check first 10 mins initial reposnse actions have been completed:",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Confirm Fault Details",
            "description": "Understand from the ARM the level of testing required. What access is needed? (Disruptive and non - disruptive). Request a milestone plan.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with TOCs / FOCs to amend train service as per contingency plan, idenifying any opportunities and risks to train service upon start up of full service.",
            "roles": [
              "Train Running Controller"
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
            "title": "Assess Incident Impact",
            "description": "Review route impact and evaluate tactical against operational plan",
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
            "title": "Review Logging Prompts",
            "description": "Consider the additional prompts mentioned in the CCIL logging template. Advise NOC London (if incident in Thames Valley Area).",
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
            "title": "Check On-Call Staff",
            "description": "Check on-call staff have been advised as per the matrix:",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Hold Team Huddle",
            "description": "Following tactical/ strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
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
            "description": "Is the incident going to plan, is there anything that needs to be escalated for further support with the incident",
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
            "title": "Review Milestone Updates",
            "description": "Review updates against the milsetone plan and escalate if necessary",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with TOCs / FOCs to amend train service as per contingency plan, idenifying any opportunities and risks to train service upon start up of full service. Crew implications Unit implications",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Hold Control Conference",
            "description": "consider further service management conferences / incident management conferences if required",
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
          }
        ]
      },
      {
        "name": "Service Recovery",
        "actions": [
          {
            "title": "Record Lessons Learned",
            "description": "Capture learnings / findings. Consider whether trauma support required for any control staff",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor Response Actions",
            "description": "Continue to review the activities against the milestone plan until the asset is signed back into use.",
            "roles": [
              "Incident Controller"
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
            "title": "Plan Service Resumption",
            "description": "Prepare for resumption of service or contingency options",
            "roles": [
              "RCM"
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
            "title": "Assess Stranded Train Risk",
            "description": "Upload Stranded Trains risk assessment to CCIL",
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
