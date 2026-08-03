const userService = require("../services/userService");
const AppError = require("../utils/AppError");

/**
 * Handles user management HTTP requests.
 */
class UserController {
  constructor() {
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.disable = this.disable.bind(this);
    this.enable = this.enable.bind(this);
    this.updateRoles = this.updateRoles.bind(this);
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
   * Get all users.
   */
  getAll(req, res) {
    const result = userService.getUsers(req.query);

    this._sendJSON(res, 200, {
      success: true,
      data: result.rows,
      meta: result.meta,
    });
  }

  /**
   * Get user by ID.
   */
  getById(req, res) {
    const user = userService.getUserById(this._getId(req.params.id));

    if (!user) {
      throw new AppError("User not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  /**
   * Create user.
   */
  create(req, res) {
    const user = userService.createUser(
      req.body.email,
      req.body.password,
      req.body.role,
      req.body.role_ids || [],
      req.user.id,
    );

    this._sendJSON(res, 201, {
      success: true,
      data: user,
    });
  }

  /**
   * Update user.
   */
  update(req, res) {
    const user = userService.updateUser(
      this._getId(req.params.id),
      req.body,
      req.user.id,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  /**
   * Disable user.
   */
  disable(req, res) {
    const user = userService.disableUser(
      this._getId(req.params.id),
      req.user.id,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  /**
   * Enable user.
   */
  enable(req, res) {
    const user = userService.enableUser(
      this._getId(req.params.id),
      req.user.id,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  /**
   * Update user roles.
   */
  updateRoles(req, res) {
    const user = userService.updateUserRoles(
      this._getId(req.params.id),
      req.body.role_ids || [],
    );

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }
}

module.exports = new UserController();
