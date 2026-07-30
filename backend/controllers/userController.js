const userService = require("../services/userService");
const AppError = require("../utils/AppError");

class UserController {
  _sendJSON(res, status, payload) {
    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getAll(req, res) {
    this._sendJSON(res, 200, {
      success: true,
      data: userService.getUsers(),
    });
  }

  getById(req, res) {
    const user = userService.getUserById(Number(req.params.id));

    if (!user) {
      throw new AppError("User not found", 404);
    }

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  updateRoles(req, res) {
    const user = userService.updateUserRoles(
      Number(req.params.id),
      req.body.role_ids || [],
    );

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  create(req, res) {
    const user = userService.createUser(
      req.body.email,
      req.body.password,
      req.body.role,
      req.body.role_ids || [],
    );

    this._sendJSON(res, 201, {
      success: true,
      data: user,
    });
  }

  update(req, res) {
    const user = userService.updateUser(Number(req.params.id), req.body);

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  disable(req, res) {
    const user = userService.disableUser(Number(req.params.id), req.user.id);

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }

  enable(req, res) {
    const user = userService.enableUser(Number(req.params.id));

    this._sendJSON(res, 200, {
      success: true,
      data: user,
    });
  }
}

module.exports = new UserController();
