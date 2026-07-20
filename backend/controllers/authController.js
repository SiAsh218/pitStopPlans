/**
 * ============================================================
 * Auth Controller (Authentication API Layer)
 * ============================================================
 *
 * Purpose:
 * - Handles authentication-related HTTP requests
 * - Delegates authentication logic to AuthService
 * - Returns consistent JSON responses
 *
 * Responsibilities:
 * ✅ Handle user registration
 * ✅ Handle user login
 * ✅ Return JWT tokens and user data
 *
 * IMPORTANT:
 * - DOES NOT contain authentication logic itself
 * - Delegates all logic to authService
 *
 * Related Flow:
 *   Request → Controller → AuthService → Repository → DB
 *
 * ============================================================
 */

const authService = require("../services/authService");

class AuthController {
  /**
   * ============================================================
   * POST /api/auth/register
   * ============================================================
   *
   * Registers a new user
   *
   * Expected body:
   * {
   *   email: string,
   *   password: string
   * }
   *
   * Flow:
   * 1. Extract email + password from request
   * 2. Call AuthService.register()
   * 3. Return created user (without sensitive data)
   */
  register(req, res) {
    const { email, password } = req.body;

    /**
     * Delegate registration logic to service
     */
    const user = authService.register(email, password);

    /**
     * Send response
     */
    this._send(res, 201, user);
  }

  /**
   * ============================================================
   * POST /api/auth/login
   * ============================================================
   *
   * Logs a user in and returns a JWT token
   *
   * Expected body:
   * {
   *   email: string,
   *   password: string
   * }
   *
   * Response:
   * {
   *   token: string,
   *   user: { id, email, role }
   * }
   */
  login(req, res) {
    const { email, password } = req.body;

    /**
     * Delegate authentication logic to service
     */
    const result = authService.login(email, password);

    /**
     * Send response (includes JWT)
     */
    this._send(res, 200, result);
  }

  validate(req, res) {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        success: true,
        data: {
          id: req.user.id,
          role: req.user.role,
        },
      }),
    );
  }

  /**
   * ============================================================
   * Helper: Send JSON Response
   * ============================================================
   *
   * Ensures consistent API response format
   *
   * @param {ServerResponse} res
   * @param {number} code - HTTP status code
   * @param {object} data - Response payload
   */
  _send(res, code, data) {
    res.writeHead(code, { "Content-Type": "application/json" });

    res.end(
      JSON.stringify({
        success: true,
        data,
      }),
    );
  }
}

module.exports = new AuthController();
