/**
 * ============================================================
 * AppError (Custom Error Class)
 * ============================================================
 *
 * Purpose:
 * - Standardises how errors are created across the application
 * - Allows attaching an HTTP status code to errors
 * - Enables consistent error handling in the router
 *
 * Why this exists:
 * ------------------------------------------------------------
 * Native JavaScript Error only supports:
 *   - message
 *
 * But APIs need:
 *   ✅ HTTP status codes (e.g. 404, 401, 500)
 *   ✅ Structured error handling
 *
 * This class extends Error to include:
 *   - message → human-readable error
 *   - statusCode → HTTP response code
 *
 * ============================================================
 */

class AppError extends Error {
  /**
   * Create a new application error
   *
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   *
   * Example:
   *   throw new AppError("Not Found", 404)
   */
  constructor(message, statusCode) {
    /**
     * Call parent Error constructor
     * Sets the error message
     */
    super(message);

    /**
     * HTTP status code for this error
     *
     * Used by router to set response status
     */
    this.statusCode = statusCode;
  }
}

/**
 * Export custom error class
 */
module.exports = AppError;
