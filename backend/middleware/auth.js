/**
 * ============================================================
 * Authentication Middleware (JWT)
 * ============================================================
 *
 * Purpose:
 * - Ensures that incoming requests are authenticated
 * - Validates a JWT (JSON Web Token) from the request headers
 * - Attaches the authenticated user to req.user
 *
 * Used in:
 * - Protected routes (via router)
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 *
 * Flow:
 * 1. Check for Authorization header
 * 2. Validate header format
 * 3. Extract token
 * 4. Verify token via authService
 * 5. Attach decoded user to req.user
 * ============================================================
 */

const authService = require("../services/authService");
const AppError = require("../utils/AppError");

module.exports = function auth(req, res) {
  /**
   * ============================================================
   * 1. Extract Authorization header
   * ============================================================
   *
   * The header should exist for all protected routes.
   */
  const header = req.headers["authorization"];

  if (!header) {
    // ✅ No token provided → user is not authenticated
    throw new AppError("Unauthorized", 401);
  }

  /**
   * ============================================================
   * 2. Validate header format
   * ============================================================
   *
   * Expected format:
   *   "Bearer <token>"
   *
   * We split on space:
   *   ["Bearer", "<token>"]
   */
  const parts = header.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    // ✅ Incorrect format (e.g. missing Bearer keyword)
    throw new AppError("Invalid token format", 401);
  }

  /**
   * ============================================================
   * 3. Extract token
   * ============================================================
   */
  const token = parts[1];

  /**
   * ============================================================
   * 4. Verify token
   * ============================================================
   *
   * authService.verify():
   * - Checks token signature
   * - Ensures token has not expired
   * - Returns decoded payload if valid
   *
   * Example payload:
   * {
   *   id: 1,
   *   role: "admin"
   * }
   */
  let decoded;

  try {
    decoded = authService.verify(token);
  } catch (err) {
    // ✅ Token invalid or expired
    throw new AppError("Invalid token", 401);
  }

  /**
   * ============================================================
   * 5. Attach user to request
   * ============================================================
   *
   * This makes the authenticated user available throughout:
   * - route middleware (requireRole)
   * - controllers
   *
   * Example usage:
   *   req.user.id
   *   req.user.role
   */
  req.user = decoded;

  /**
   * ============================================================
   * 6. Continue request pipeline
   * ============================================================
   */
  return true;
};
