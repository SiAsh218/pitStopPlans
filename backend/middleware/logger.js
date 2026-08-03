/**
 * Request logging middleware.
 *
 * Logs the HTTP method and URL for every incoming request.
 *
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 * @returns {boolean}
 */
function logger(req, res) {
  console.log(`[${req.method}] ${req.url}`);

  return true;
}

module.exports = logger;
