const incidentService = require("../services/incidentService");

const AppError = require("../utils/AppError");

class IncidentController {
  /**
   * Send JSON response
   */
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * Get all incidents
   */
  getAll(req, res) {
    const incidents = incidentService.getAllIncidents();

    this._sendJSON(res, 200, {
      success: true,
      data: incidents,
    });
  }

  /**
   * Get incident by id
   */
  getById(req, res) {
    const id = Number(req.params.id);

    const incident = incidentService.getIncidentById(id);

    if (!incident) {
      throw new AppError("Incident not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: incident,
    });
  }

  /**
   * Create incident
   */
  create(req, res) {
    const incident = incidentService.createIncident(req.body, req.user.id);

    this._sendJSON(res, 201, {
      success: true,
      data: incident,
    });
  }

  close(req, res) {
    const incident = incidentService.closeIncident(
      Number(req.params.id),
      req.user.id,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: incident,
    });
  }

  dashboard(req, res) {
    const data = incidentService.getIncidentDashboard(Number(req.params.id));

    if (!data) {
      throw new AppError("Incident not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data,
    });
  }
}

module.exports = new IncidentController();
