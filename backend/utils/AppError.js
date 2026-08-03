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
 * ============================================================
 */

/**
 * Application-specific error that includes
 * an HTTP status code.
 *
 * @extends Error
 */
class AppError extends Error {
  /**
   * Creates a new application error.
   *
   * @param {string} message - Human-readable error message.
   * @param {number} [statusCode=500] - HTTP status code.
   */
  constructor(message, statusCode = 500) {
    super(message);

    /**
     * Error name for debugging and logging.
     *
     * @type {string}
     */
    this.name = "AppError";

    /**
     * HTTP status code associated with the error.
     *
     * @type {number}
     */
    this.statusCode = statusCode;

    Error.captureStackTrace?.(this, AppError);
  }
}

module.exports = AppError;
