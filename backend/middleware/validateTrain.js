/**
 * ============================================================
 * Train Validation Middleware
 * ============================================================
 *
 * Purpose:
 * - Validates incoming request data for train-related endpoints
 * - Ensures required fields are present and valid
 *
 * Responsibilities:
 * ✅ Apply only to train routes (/api/trains)
 * ✅ Validate POST (create) requests
 * ✅ Validate PUT (update) requests
 *
 * IMPORTANT:
 * - This runs BEFORE the controller
 * - Prevents invalid data reaching the service layer
 *
 * ============================================================
 */

const AppError = require("../utils/AppError");

module.exports = function validateTrain(req, res) {
  /**
   * ============================================================
   * 1. Only apply to train API routes
   * ============================================================
   *
   * Skip validation for non-train endpoints
   */
  if (!req.url.startsWith("/api/trains")) {
    return true;
  }

  /**
   * ============================================================
   * 2. Only validate POST and PUT requests
   * ============================================================
   */
  if (req.method === "POST" || req.method === "PUT") {
    /**
     * Extract expected fields from request body
     */
    const { name, status, from, to } = req.body;

    /**
     * ============================================================
     * 3. POST validation (creating a train)
     * ============================================================
     *
     * All required fields must be present
     */
    if (req.method === "POST") {
      if (!name || !status || !from || !to) {
        throw new AppError("Missing required fields", 400);
      }
    }

    /**
     * ============================================================
     * 4. PUT validation (updating a train)
     * ============================================================
     *
     * At least one field must be provided
     */
    if (req.method === "PUT") {
      /**
       * IMPORTANT:
       * - Checks if ALL fields are missing
       * - If so, reject request
       */
      if (!name && !status && !from && !to && req.body.delayed === undefined) {
        throw new AppError("No fields provided for update", 400);
      }
    }
  }

  /**
   * ============================================================
   * 5. Continue middleware pipeline
   * ============================================================
   */
  return true;
};
