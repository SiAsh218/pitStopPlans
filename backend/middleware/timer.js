/**
 * ============================================================
 * Request Timer Middleware
 * ============================================================
 *
 * Purpose:
 * - Measures how long each request takes to complete
 * - Logs request method, URL, and duration
 *
 * Responsibilities:
 * ✅ Track request start time
 * ✅ Listen for response completion
 * ✅ Log execution time
 *
 * IMPORTANT:
 * - Uses the "finish" event on the response
 * - Does NOT block or modify request flow
 *
 * ============================================================
 */

module.exports = async function timer(req, res) {
  /**
   * ============================================================
   * 1. Capture start time
   * ============================================================
   */
  const start = Date.now();

  /**
   * ============================================================
   * 2. Hook into response lifecycle
   * ============================================================
   *
   * The "finish" event fires when:
   * - Response has been fully sent to the client
   * - All headers and body data are flushed
   *
   * This ensures we measure total request duration
   */
  res.on("finish", () => {
    /**
     * Calculate elapsed time in milliseconds
     */
    const time = Date.now() - start;

    /**
     * Log result
     *
     * Example:
     * ⏱ GET /api/trains - 12ms
     */
    console.log(`⏱ ${req.method} ${req.url} - ${time}ms`);
  });

  /**
   * ============================================================
   * 3. Continue middleware pipeline
   * ============================================================
   */
  return true;
};
