const incidentRepository = require("../data/repositories/incidentRepository");
const incidentActionRepository = require("../data/repositories/incidentActionRepository");
const incidentActionUpdateRepository = require("../data/repositories/incidentActionUpdateRepository");

class ReportingService {
  getIncidents(options) {
    return incidentRepository.findAllWithDetailsQuery(options);
  }

  getActions(options) {
    return incidentActionRepository.findAllWithQuery(options);
  }

  getActionRoles(options) {
    return incidentActionRepository.findAllActionRolesWithQuery(options);
  }

  getActionUpdates(options) {
    return incidentActionUpdateRepository.findAllWithDetailsWithQuery(options);
  }
}

module.exports = new ReportingService();
