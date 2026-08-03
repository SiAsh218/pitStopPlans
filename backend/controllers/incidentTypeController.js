const incidentTypeService = require("../services/incidentTypeService");
const AppError = require("../utils/AppError");

/**
 * Handles incident type HTTP requests.
 */
class IncidentTypeController {
  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * Sends a JSON response.
   *
   * @param {import("http").ServerResponse} res
   * @param {number} statusCode
   * @param {object} payload
   * @returns {void}
   */
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * Retrieves incident types.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getAll(req, res) {
    const result = incidentTypeService.getAllIncidentTypes(req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Retrieves an incident type by ID.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getById(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const incidentType = incidentTypeService.getIncidentTypeById(id);

    if (!incidentType) {
      throw new AppError("Incident Type not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: incidentType,
    });
  }

  /**
   * Creates an incident type.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  create(req, res) {
    const { name, description } = req.body;

    const incidentType = incidentTypeService.createIncidentType({
      name,
      description,
    });

    this._sendJSON(res, 201, {
      success: true,
      data: incidentType,
    });
  }

  /**
   * Updates an incident type.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  update(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const incidentType = incidentTypeService.updateIncidentType(id, req.body);

    if (!incidentType) {
      throw new AppError("Incident Type not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: incidentType,
    });
  }

  /**
   * Deletes an incident type.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  delete(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const deleted = incidentTypeService.deleteIncidentType(id);

    if (!deleted) {
      throw new AppError("Incident Type not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      message: "Incident Type deleted",
    });
  }
}

module.exports = new IncidentTypeController();
