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
}

module.exports = new ReportingController();
