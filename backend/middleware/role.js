/**
 * ============================================================
 * Role-Based Access Control (Authorization Middleware)
 * ============================================================
 *
 * Purpose:
 * - Restricts access to routes based on user roles
 * - Ensures only users with permitted roles can proceed
 *
 * Usage (in router):
 *
 *   handler: [
 *     auth,
 *     requireRole("admin", "editor"),
 *     controllerMethod
 *   ]
 *
 * Flow:
 * 1. Ensure user is authenticated (req.user exists)
 * 2. Check if user's role is in allowedRoles
 * 3. Allow or block request
 *
 * ============================================================
 */

const AppError = require("../utils/AppError");

/**
 * Factory function that returns middleware
 *
 * @param  {...string} allowedRoles
 * Example:
 *   requireRole("admin", "editor")
 */
module.exports = function requireRole(...allowedRoles) {
  /**
   * Returned middleware function
   *
   * Runs during request pipeline
   */
  return (req, res) => {
    /**
     * ============================================================
     * 1. Ensure user is authenticated
     * ============================================================
     *
     * This should already be handled by auth middleware,
     * but we defensively check again.
     */
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    /**
     * ============================================================
     * 2. Check user role against allowed roles
     * ============================================================
     *
     * req.user.role comes from decoded JWT (set in auth middleware)
     *
     * Example:
     *   req.user.role = "user"
     *   allowedRoles = ["admin", "editor"]
     */
    if (!allowedRoles.includes(req.user.role)) {
      /**
       * User is authenticated but does not have permission
       */
      throw new AppError("Forbidden", 403);
    }

    /**
     * ============================================================
     * 3. Continue request pipeline
     * ============================================================
     */
    return true;
  };
};
