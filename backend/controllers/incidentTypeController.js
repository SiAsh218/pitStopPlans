const incidentTypeService = require("../services/incidentTypeService.js");
const AppError = require("../utils/AppError");

class IncidentTypeController {
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  }

  getAll(req, res) {
    const incidentTypes = incidentTypeService.getAllIncidentTypes();

    this._sendJSON(res, 200, {
      success: true,
      data: incidentTypes,
    });
  }

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

  create(req, res) {
    const { name, description } = req.body;

    const newIncidentType = incidentTypeService.createIncidentType({
      name,
      description,
    });

    this._sendJSON(res, 201, {
      success: true,
      data: newIncidentType,
    });
  }

  update(req, res) {
    const id = Number(req.params.id);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    const updated = incidentTypeService.updateIncidentType(id, req.body);

    if (!updated) {
      throw new AppError("Incident Type not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: updated,
    });
  }

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
