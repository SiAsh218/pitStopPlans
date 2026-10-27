const incidentRepository = require("../data/repositories/incidentRepository");
const incidentActionRepository = require("../data/repositories/incidentActionRepository");
const incidentActionUpdateRepository = require("../data/repositories/incidentActionUpdateRepository");
const incidentTypeRepository = require("../data/repositories/incidentTypeRepository");
const planStageRepository = require("../data/repositories/planStageRepository");
const planStageActionRepository = require("../data/repositories/planStageActionRepository");
const roleRepository = require("../data/repositories/roleRepository");
const userRepository = require("../data/repositories/userRepository");
const auditLogRepository = require("../data/repositories/auditLogRepository");
const BaseRepository = require("../data/repositories/baseRepository");

const planTemplateReportingRepository = new BaseRepository("plan_templates");
const planStageActionRoleRepository = new BaseRepository(
  "plan_stage_action_roles",
);
const userRoleReportingRepository = new BaseRepository("user_roles");

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

  getIncidentTypes(options) {
    return incidentTypeRepository.findAllWithQuery(options);
  }

  getPlanTemplates(options) {
    return planTemplateReportingRepository.findAllWithQuery(options);
  }

  getPlanStages(options) {
    return planStageRepository.findAllWithQuery(options);
  }

  getPlanStageActions(options) {
    return planStageActionRepository.findAllWithQuery(options);
  }

  getPlanStageActionRoles(options) {
    return planStageActionRoleRepository.findAllWithQuery(options);
  }

  getRoles(options) {
    return roleRepository.findAllWithQuery(options);
  }

  getUserRoles(options) {
    return userRoleReportingRepository.findAllWithQuery(options);
  }

  getUsers(options) {
    return userRepository.findAllForReportingWithQuery(options);
  }

  getAuditLogs(options) {
    return auditLogRepository.findAllWithQuery(options);
  }
}

module.exports = new ReportingService();
