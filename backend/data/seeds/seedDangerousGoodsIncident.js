const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Dangerous Goods Incident",
    "description": "Dangerous Goods Incident affecting rail services.",
    "version": 4,
    "title": "Dangerous Goods Incident Plan",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Notify NR Senior Leader",
            "description": "Network Rail Senior Leader / on-call advised (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Deploy Responders",
            "description": "Confirm that the correct responders have been sent to site.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Confirm Incident Category",
            "description": "Categorisation of Incident Black Red Amber",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Assess Incident Report",
            "description": "On receiving a report of a Rail Dangerous Goods Emergency, categorise as an Incident or Irregularity. (See Rule Book Module TW4, Sections 9 & 10). Signaller advised 'This is a Rail Dangerous Goods Emergency'. Make a TOPs enquiry (TOPs Command SD HAZ and UN number gives details of the commodity). SD DANF gives details of specialist contact. Also published in RSSB handbook RS524 'List of Dangerous Goods & their United Nations Numbers.' Call the emergency services. Understand impact - what lines /stations are affected, can we run on opposite lines?. Will the incident need an isolation of the OLE? Contact MOM, appoint as RIO despatch to site - request ETA",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Review IC Brief",
            "description": "Received brief from IC to fully understand the infrastructure restrictions:",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Notify TOC Senior Leader",
            "description": "TOC Senior Leader / on-call advised MTR / GWR / XC / HEx / Freight / Chiltern / SWR - (Via WhatsApp group)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Notify TOC Managers",
            "description": "TOC Duty Control Managers advised: MTR / GWR / XC / Hex / Freight / Chiltern / SWR / Freight",
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
            "title": "Contact EIU Team",
            "description": "Contact EIU if applicable and despatch to site - request ETA Alert specialist advice (TOPs Command SD DANF and Alpha code gives the details)",
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
            "title": "Establish Command Structure",
            "description": "Does the command structure need to be set up? (If more than three stranded trains stand up RIC)",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "30 second brief to the TRC / TOC Leads, SNDM & RCM on the incident. Check that trains are being held back and not heading towards the incident.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Inform Train Operators",
            "description": "Train Operators have been informed and contingency plan has been implemented.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Notify NOC London",
            "description": "Has FSDM at NOC been advised?",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm Tactical Plan",
            "description": "Confirm immediate tactical plan with IC and TOC control lead. Prepare for escalation if necessary.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Brief Control Teams",
            "description": "Ensure Control Team and TOC / FOC control teams are fully aware of Incident. Are any passenger trains stranded as a result of the incident?",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Manage Stranded Trains",
            "description": "Are there any stranded trains? Update stranded trains board.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Assess Stranded Train Risk",
            "description": "Complete stranded train risk assessment and prepare plans A, B & C.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Request TOLO Relief",
            "description": "Request a TOLO / Rolling Stock Technician to attend site - Request ETA Consider - Can Another FOC dispatch a fitter faster to assist?",
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
            "title": "Assign Cross-Check",
            "description": "Agree with RCM who will cross-check first 10 minutes. (Initial response actions completed).",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Create Milestone Plan",
            "description": "Request initial milestone plan once RIO on site and situation assessed. Check if the incident is near watercourses, advise Enviroment agency.",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Hold Service Conference",
            "description": "Train service Management Conference held?",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Hold Team Huddle",
            "description": "Following Tactical/ Strategic conferences, huddles with IC & TRC teams are to be undertaken to provide details of decisions and create a shared situational awareness and recorded in CCIL",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Complete Cross-Check",
            "description": "Undertake the cross-check",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Review Response Options",
            "description": "Review current response, would the use of drones help with the response to the incident. Is an assisting locomotive needed to move the train? Has this been arranged and ETA? Could another FOC have a loco closer that can clear the line more quickly?",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Hold Incident Conference",
            "description": "Incident Management Conference held? (Staff called as per on call matrix?)",
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
            "title": "Notify Incident Teams",
            "description": "Has Head of Freight been advised?",
            "roles": [
              "SNDM"
            ]
          }
        ]
      },
      {
        "name": "Planned Response",
        "actions": [
          {
            "title": "Monitor Milestone Plan",
            "description": "Monitor milestone plan against activities. Advise NOC London (if incident affecting TV area)",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Update Amber Messages",
            "description": "Continue to send updated Tyrell / Amber messages based on the information available.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Monitor Milestone Plan",
            "description": "Monitor milestone plan against activities",
            "roles": [
              "Incident Controller"
            ]
          },
          {
            "title": "Amend Train Service",
            "description": "Work with TOC / FOCs to amend train service as per contingency plan identifying opportunities and risks to train service upon start up of full service.",
            "roles": [
              "Train Running Controller"
            ]
          },
          {
            "title": "Monitor Stranded Trains",
            "description": "Monitor stranded train management against the risk assessment.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Complete 11-30 Check",
            "description": "Undertake the 11-30 minutes cross-check.",
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
            "title": "Monitor Service Recovery",
            "description": "Oversee progress with service recovery an escalate if necessary",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Monitor TOC Recovery",
            "description": "Oversee TOC recovery plan.",
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
            "title": "Update Stranded Train Board",
            "description": "If stranded trains board used, photograph and upload to CCIL.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm Service Recovery",
            "description": "Declare Service Recovery complete. Upload Stranded Trains risk assessment to CCIL",
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
