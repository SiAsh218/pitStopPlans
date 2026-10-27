const seedPlanTemplate = require("./seedPlanTemplate");

module.exports = function seedTemplate(adminUser) {
  seedPlanTemplate(adminUser, {
    "name": "Repeat Failure",
    "description": "Repeat Failure affecting rail services.",
    "version": 1,
    "title": "Repeat Failure Plan",
    "stages": [
      {
        "name": "Initial Response",
        "actions": [
          {
            "title": "Assess Reputational Risk",
            "description": "Consider the reputational damage that may be caused by the repeat failure. Make sure all Control Messaging (including WhatsApp groups) details actions being taken in light of the repeat failure.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm IC Brief",
            "description": "Confirm with the IC whether the failure is being classified as a repeat failure or not. If it is a repeat failure, immediately classify the incident as AMBER as a minimum. If an ARM has not already been appointed, ensure that one is appointed immediately. Consider what additional support may be required by the team attending the fault and make sure the fault is escalated promptly.",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Notify Incident Teams",
            "description": "Once advised by the RCM that the failure is being treated as a repeat failure, make sure the initial and all subsequent Tyrell messages are sent out as AMBER as a minimum. Update messaging as directed by the RCM.",
            "roles": [
              "Information Controller"
            ]
          },
          {
            "title": "Check Failure History",
            "description": "Identify (via FMS or Control logs) whether the asset has failed within the last 3 months. If it has failed within that timeframe it is to be classed as a repeat failure. Appoint ARM if one is not already in place. Mobilise PWAY and S&T to site to provide a multidisciplinary response, ensuring all resources are in place to respond to the failure and undertake a multi-disciplinary inspection",
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
            "title": "Brief Crisis Commander",
            "description": "Ensure the Crisis Commander is aware of the strategy for managing the repeat failure and how reputational damage",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Notify Incident Teams",
            "description": "Notify RAM team, DU P&A engineer (via on call process if applicable).",
            "roles": [
              "RCM"
            ]
          },
          {
            "title": "Review Fault History",
            "description": "Ensure ARM is in receipt of all recent data from the Control Centre Technician (CCT) and or Box TO. Request the ARM undertakes a review of previous fault information alongside asset history.",
            "roles": [
              "Incident Controller"
            ]
          }
        ]
      },
      {
        "name": "Planned Response",
        "actions": [
          {
            "title": "Confirm Asset Handover",
            "description": "If the asset is handed back with more work planned make sure Control Messaging is clear that is the case and clearly details all mitigations that have been put in place.",
            "roles": [
              "SNDM"
            ]
          },
          {
            "title": "Confirm Asset Handover",
            "description": "If the asset is handed back with further work planned to fully rectify the fault, make sure the preferred position to maintain the asset has been agreed alongside the respective signalling location; and ensure any movements outside of this agreed position are only undertaken with response teams positioned in the area.",
            "roles": [
              "RCM"
            ]
          }
        ]
      },
      {
        "name": "Service Recovery",
        "actions": [
          {
            "title": "Hold Control Conference",
            "description": "Add details to 0900 conference agenda.",
            "roles": [
              "SNDM"
            ]
          }
        ]
      }
    ]
  }
  );
};
