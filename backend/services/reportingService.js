const incidentRepository = require("../data/repositories/incidentRepository");
const incidentActionRepository = require("../data/repositories/incidentActionRepository");
const incidentActionUpdateRepository = require("../data/repositories/incidentActionUpdateRepository");

class ReportingService {
  getIncidents() {
    return incidentRepository.findAllWithDetails();
  }

  getActions() {
    return incidentActionRepository.findAll();
  }

  getActionRoles() {
    return incidentActionRepository.findAllActionRoles();
  }

  getActionUpdates() {
    return incidentActionUpdateRepository.findAllWithDetails();
  }
}

module.exports = new ReportingService();
