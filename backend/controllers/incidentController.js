const incidentService = require("../services/incidentService");
const AppError = require("../utils/AppError");

/**
 * Handles incident HTTP requests and converts
 * service results into API responses.
 */
class IncidentController {
  constructor() {
    // Bind methods once so route definitions don't need .bind(...)
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.close = this.close.bind(this);
    this.reopen = this.reopen.bind(this);
    this.dashboard = this.dashboard.bind(this);
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

  /**
   * Get all incidents.
   *
   * @param {object} req - HTTP request.
   * @param {import("http").ServerResponse} res - HTTP response.
   * @returns {void}
   */
  getAll(req, res) {
    const result = incidentService.getAllIncidents(req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Get an incident by identifier.
   *
   * @param {object} req - HTTP request.
   * @param {import("http").ServerResponse} res - HTTP response.
   * @returns {void}
   * @throws {AppError} When the incident cannot be found.
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
   * Create a new incident.
   *
   * @param {object} req - HTTP request.
   * @param {import("http").ServerResponse} res - HTTP response.
   * @returns {void}
   */
  create(req, res) {
    const incident = incidentService.createIncident(req.body, req.user.id);

    this._sendJSON(res, 201, {
      success: true,
      data: incident,
    });
  }

  /**
   * Close an incident.
   *
   * @param {object} req - HTTP request.
   * @param {import("http").ServerResponse} res - HTTP response.
   * @returns {void}
   */
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

  reopen(req, res) {
    const incident = incidentService.reopenIncident(
      Number(req.params.id),
      req.user.id,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: incident,
    });
  }

  /**
   * Get dashboard data for an incident.
   *
   * @param {object} req - HTTP request.
   * @param {import("http").ServerResponse} res - HTTP response.
   * @returns {void}
   * @throws {AppError} When the incident cannot be found.
   */
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
