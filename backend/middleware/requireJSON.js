/**
 * ============================================================
 * Require JSON Middleware
 * ============================================================
 *
 * Purpose:
 * - Ensures that incoming POST and PUT requests use JSON format
 * - Validates the Content-Type header
 *
 * Responsibilities:
 * ✅ Check Content-Type header for JSON
 * ✅ Block invalid requests early
 * ✅ Return consistent error response
 *
 * IMPORTANT:
 * - Runs before request body is processed
 * - Prevents invalid input formats reaching your application
 *
 * ============================================================
 */

module.exports = async function requireJSON(req, res) {
  /**
   * ============================================================
   * 1. Only apply to POST and PUT requests
   * ============================================================
   *
   * GET requests do not have a body, so skip validation
   */
  if (req.method === "POST" || req.method === "PUT") {
    /**
     * Extract Content-Type header
     */
    const contentType = req.headers["content-type"];

    /**
     * ============================================================
     * 2. Validate Content-Type
     * ============================================================
     *
     * Must contain "application/json"
     */
    if (!contentType || !contentType.includes("application/json")) {
      /**
       * Send error response immediately
       */
      res.writeHead(400, { "Content-Type": "application/json" });

      res.end(
        JSON.stringify({
          success: false,
          error: "Content-Type must be application/json",
        }),
      );

      /**
       * Stop further middleware/route execution
       *
       * Returning false signals the router to stop processing
       */
      return false;
    }
  }

  /**
   * ============================================================
   * 3. Continue middleware pipeline
   * ============================================================
   */
  return true;
};
