const incidentService = require("../services/incidentService");
const AppError = require("../utils/AppError");

class ReportingController {
  constructor() {
    this.getIncidents = this.getIncidents.bind(this);
    this.getById = this.getById.bind(this);
  }

  /**
   * Sends a JSON response.
   *
   * @param {import("http").ServerResponse} res - HTTP response.
   * @param {number} statusCode - HTTP status code.
   * @param {object} payload - Response payload.
   * @returns {void}
   */
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getIncidents(req, res) {
    const incidents = incidentService.getAllIncidents(req.query);

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        success: true,
        data: incidents,
      }),
    );
  }

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
}

module.exports = new ReportingController();
