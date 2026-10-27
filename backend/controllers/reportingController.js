const reportingService = require("../services/reportingService");

class ReportingController {
  constructor() {
    this.getIncidents = this.getIncidents.bind(this);
    this.getActions = this.getActions.bind(this);
    this.getActionRoles = this.getActionRoles.bind(this);
    this.getActionUpdates = this.getActionUpdates.bind(this);
    this.getIncidentTypes = this.getIncidentTypes.bind(this);
    this.getPlanTemplates = this.getPlanTemplates.bind(this);
    this.getPlanStages = this.getPlanStages.bind(this);
    this.getPlanStageActions = this.getPlanStageActions.bind(this);
    this.getPlanStageActionRoles = this.getPlanStageActionRoles.bind(this);
    this.getRoles = this.getRoles.bind(this);
    this.getUserRoles = this.getUserRoles.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getAuditLogs = this.getAuditLogs.bind(this);
  }

  _sendJSON(res, payload) {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(payload));
  }

  getIncidents(req, res) {
    this._sendJSON(res, reportingService.getIncidents(req.query));
  }

  getActions(req, res) {
    this._sendJSON(res, reportingService.getActions(req.query));
  }

  getActionRoles(req, res) {
    this._sendJSON(res, reportingService.getActionRoles(req.query));
  }

  getActionUpdates(req, res) {
    this._sendJSON(res, reportingService.getActionUpdates(req.query));
  }

  getIncidentTypes(req, res) {
    this._sendJSON(res, reportingService.getIncidentTypes(req.query));
  }

  getPlanTemplates(req, res) {
    this._sendJSON(res, reportingService.getPlanTemplates(req.query));
  }

  getPlanStages(req, res) {
    this._sendJSON(res, reportingService.getPlanStages(req.query));
  }

  getPlanStageActions(req, res) {
    this._sendJSON(res, reportingService.getPlanStageActions(req.query));
  }

  getPlanStageActionRoles(req, res) {
    this._sendJSON(res, reportingService.getPlanStageActionRoles(req.query));
  }

  getRoles(req, res) {
    this._sendJSON(res, reportingService.getRoles(req.query));
  }

  getUserRoles(req, res) {
    this._sendJSON(res, reportingService.getUserRoles(req.query));
  }

  getUsers(req, res) {
    this._sendJSON(res, reportingService.getUsers(req.query));
  }

  getAuditLogs(req, res) {
    this._sendJSON(res, reportingService.getAuditLogs(req.query));
  }
}

module.exports = new ReportingController();
