const roleService = require("../services/roleService");
const AppError = require("../utils/AppError");

/**
 * Handles role HTTP requests.
 */
class RoleController {
  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
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
   * Validates and returns an ID value.
   *
   * @param {string} value
   * @returns {number}
   */
  _getId(value) {
    const id = Number(value);

    if (!id) {
      throw new AppError("Invalid ID", 400);
    }

    return id;
  }

  /**
   * Get all roles.
   */
  getAll(req, res) {
    const result = roleService.getAllRoles(req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Get role by ID.
   */
  getById(req, res) {
    const role = roleService.getRoleById(this._getId(req.params.id));

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: role,
    });
  }

  /**
   * Create role.
   */
  create(req, res) {
    const role = roleService.createRole(req.body.name);

    this._sendJSON(res, 201, {
      success: true,
      data: role,
    });
  }

  /**
   * Delete role.
   */
  delete(req, res) {
    const deleted = roleService.deleteRole(this._getId(req.params.id));

    if (!deleted) {
      throw new AppError("Role not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
    });
  }

  /**
   * Update role.
   */
  update(req, res) {
    const role = roleService.updateRole(this._getId(req.params.id), req.body);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: role,
    });
  }
}

module.exports = new RoleController();
