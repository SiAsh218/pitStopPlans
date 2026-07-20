const roleService = require("../services/roleService");

const AppError = require("../utils/AppError");

class RoleController {
  _sendJSON(res, status, payload) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getAll(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: roleService.getAllRoles(),
    });
  }

  getById(req, res) {
    const role = roleService.getRoleById(Number(req.params.id));

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: role,
    });
  }

  create(req, res) {
    const role = roleService.createRole(req.body.name);

    this._sendJSON(res, 201, {
      success: true,
      data: role,
    });
  }

  delete(req, res) {
    const deleted = roleService.deleteRole(Number(req.params.id));

    if (!deleted) {
      throw new AppError("Role not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
    });
  }
}

module.exports = new RoleController();
