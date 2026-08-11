const reportingService = require("../services/reportingService");

class ReportingController {
  constructor() {
    this.getIncidents = this.getIncidents.bind(this);
    this.getActions = this.getActions.bind(this);
    this.getActionRoles = this.getActionRoles.bind(this);
    this.getActionUpdates = this.getActionUpdates.bind(this);
  }

  _sendJSON(res, payload) {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(payload));
  }

  getIncidents(req, res) {
    this._sendJSON(res, reportingService.getIncidents());
  }

  getActions(req, res) {
    this._sendJSON(res, reportingService.getActions());
  }

  getActionRoles(req, res) {
    this._sendJSON(res, reportingService.getActionRoles());
  }

  getActionUpdates(req, res) {
    this._sendJSON(res, reportingService.getActionUpdates());
  }
}

module.exports = new ReportingController();
