const authService = require("../services/authService");

/**
 * Handles authentication-related HTTP requests.
 */
class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.validate = this.validate.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
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

    this._setRefreshCookie(res, result.refreshToken);

    delete result.refreshToken;

    this._send(res, 200, result);
  }

  _setRefreshCookie(res, refreshToken) {
    const secure = process.env.NODE_ENV === "production";

    const cookie = [
      `refreshToken=${encodeURIComponent(refreshToken)}`,
      "HttpOnly",
      "Path=/api/auth",
      "SameSite=Strict",
      "Max-Age=2592000",
      secure ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    res.setHeader("Set-Cookie", cookie);
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

  async refresh(req, res) {
    const refreshToken = this._getRefreshToken(req);

    const data = await authService.refresh(refreshToken);

    this._setRefreshCookie(res, data.refreshToken);

    delete data.refreshToken;

    return this._send(res, 200, data);
  }

  _getRefreshToken(req) {
    const cookieHeader = req.headers.cookie || "";

    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .map((cookie) => {
          const index = cookie.indexOf("=");

          if (index === -1) {
            return [cookie, ""];
          }

          return [
            cookie.slice(0, index),
            decodeURIComponent(cookie.slice(index + 1)),
          ];
        }),
    );

    return cookies.refreshToken || null;
  }

  async logout(req, res) {
    const refreshToken = this._getRefreshToken(req);

    await authService.logout(refreshToken);

    this._clearRefreshCookie(res);

    return this._send(res, 200, {
      message: "Logged out",
    });
  }

  _clearRefreshCookie(res) {
    const secure = process.env.NODE_ENV === "production";

    const cookie = [
      "refreshToken=",
      "HttpOnly",
      "Path=/api/auth",
      "SameSite=Strict",
      "Max-Age=0",
      secure ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    res.setHeader("Set-Cookie", cookie);
  }
}

module.exports = new AuthController();
