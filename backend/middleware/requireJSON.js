/**
 * ============================================================
 * Require JSON Middleware
 * ============================================================
 *
 * Purpose:
 * - Ensures POST and PUT requests use JSON
 * - Validates the Content-Type header
 * - Stops invalid requests before they reach controllers
 * ============================================================
 */

const JSON_CONTENT_TYPE = "application/json";
const ERROR_MESSAGE = "Content-Type must be application/json";

/**
 * Validates that body-based requests use a JSON content type.
 *
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @returns {boolean}
 */
function requireJSON(req, res) {
  if (["POST", "PUT"].includes(req.method)) {
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes(JSON_CONTENT_TYPE)) {
      res.writeHead(400, {
        "Content-Type": JSON_CONTENT_TYPE,
      });

      res.end(
        JSON.stringify({
          success: false,
          error: ERROR_MESSAGE,
        }),
      );

      return false;
    }
  }

  return true;
}

module.exports = requireJSON;
