const authService = require("../services/authService");

/**
 * Handles authentication-related HTTP requests.
 */
class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.validate = this.validate.bind(this);
  }

  /**
   * Sends a standard JSON response.
   *
   * @param {import("http").ServerResponse} res
   * @param {number} statusCode
   * @param {object} data
   * @returns {void}
   */
  _send(res, statusCode, data) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        success: true,
        data,
      }),
    );
  }

  /**
   * Registers a new user.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  register(req, res) {
    const { email, password } = req.body;

    const user = authService.register(email, password);

    this._send(res, 201, user);
  }

  /**
   * Authenticates a user.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  login(req, res) {
    const { email, password } = req.body;

    const result = authService.login(email, password);

    this._send(res, 200, result);
  }

  /**
   * Validates the authenticated user token.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  validate(req, res) {
    this._send(res, 200, {
      id: req.user.id,
      role: req.user.role,
    });
  }
}

module.exports = new AuthController();
