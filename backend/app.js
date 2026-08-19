/**
 * ============================================================
 * Main Application Class
 * ============================================================
 *
 * Purpose:
 * - Creates and configures the HTTP server
 * - Wires middleware, routing, and static file serving together
 * - Handles request lifecycle (incoming request → response)
 *
 * High-Level Flow:
 * 1. Incoming request
 * 2. Attempt to serve static files
 * 3. Parse request body
 * 4. Parse query parameters
 * 5. Execute middleware and routes
 * 6. Return response or fallback (404 / 500)
 * ============================================================
 */

require("dotenv").config();

const http = require("http");
const path = require("path");
const fs = require("fs").promises;
const logger = require("./logger.js");

const config = require("../config.json");

// Custom router
const router = require("./router");
const AppError = require("./utils/AppError");

// =========================
// Middleware Registration
// =========================

const requireJSON = require("./middleware/requireJSON");

router.use(requireJSON);

// =========================
// Database Initialisation
// =========================

const initialiseDatabase = require("./data/init");
const seedDatabase = require("./data/seed");

// =========================
// MIME Types
// =========================

const MIME_TYPES = config.mimeTypes || {};

/**
 * Main application server.
 *
 * Responsible for:
 * - HTTP server creation
 * - Static file serving
 * - Request parsing
 * - Router execution
 * - Error handling
 */
class App {
  /**
   * Creates a new application instance.
   *
   * @param {Object} options - Application options.
   * @param {number} options.port - Port to listen on.
   */
  constructor({ port }) {
    /**
     * Active listening port.
     *
     * @type {number}
     */
    this.port = port;

    /**
     * Current application environment.
     *
     * @type {string}
     */
    this.mode = process.env.NODE_ENV || "development";

    /**
     * Absolute path to static frontend assets.
     *
     * @type {string}
     */
    this.staticFilePath = path.join(__dirname, "..", config.paths.static);

    /**
     * HTTP server instance.
     *
     * @type {import("http").Server|null}
     */
    this.server = null;

    /**
     * Active host address.
     *
     * @type {string|null}
     */
    this.host = null;

    this.maxBodySize = 1024 * 1024; // 1MB
  }

  /**
   * Starts the application.
   *
   * Creates and configures the HTTP server, then
   * begins listening on the configured port.
   *
   * @async
   * @returns {Promise<void>}
   */
  async start() {
    try {
      initialiseDatabase();
      seedDatabase();
      this.runHTTP(this.mode === "production" ? "production" : "development");

      await this._listenWithRetry(this.port, this.host);
    } catch (error) {
      logger.fatal({ err: error }, "Application startup failed!");
      process.exit(1);
    }
  }

  /**
   * Attempts to bind the server to a port.
   *
   * If the port is already in use, additional ports
   * are tried until a free port is found or the retry
   * limit is reached.
   *
   * @async
   * @param {number} port - Starting port.
   * @param {string} host - Host address.
   * @returns {Promise<void>}
   */
  async _listenWithRetry(port, host) {
    const maxAttempts = 10;

    let currentPort = port;
    let attempt = 0;

    while (attempt < maxAttempts) {
      try {
        await new Promise((resolve, reject) => {
          const onError = (error) => {
            this.server.off("error", onError);
            reject(error);
          };

          this.server.once("error", onError);

          this.server.listen(currentPort, host, () => {
            this.server.off("error", onError);

            this.port = currentPort;

            resolve();
          });
        });

        logger.info(
          { host, port: this.port, mode: this.mode },
          "Server started",
        );

        return;
      } catch (error) {
        if (error.code !== "EADDRINUSE") {
          throw error;
        }

        if (this.mode === "production") {
          throw error;
        }

        attempt += 1;

        if (attempt >= maxAttempts) {
          throw error;
        }

        const previousPort = currentPort;
        currentPort += 1;

        logger.warn({ previousPort, currentPort }, "Port in use");
      }
    }
  }

  /**
   * Initialises the HTTP server and request handling.
   *
   * @param {"development"|"production"} mode - Runtime mode.
   * @returns {void}
   */
  runHTTP(mode) {
    this.mode = mode;
    this.host = mode === "production" ? config.prod.ip : config.dev.ip;

    this.server = http.createServer(async (req, res) => {
      try {
        this._setSecurityHeaders(res);
        // ====================================================
        // 1. STATIC FILE HANDLING
        // ====================================================

        const isStatic = await this._serveStaticFiles(req, res);

        if (isStatic) {
          return;
        }

        // ====================================================
        // 2. BODY PARSING
        // ====================================================

        if (["POST", "PUT"].includes(req.method)) {
          let body = "";
          let size = 0;

          for await (const chunk of req) {
            size += chunk.length;

            if (size > this.maxBodySize) {
              throw new AppError("Request too large", 413);
            }

            body += chunk.toString();
          }

          if (body.trim().length === 0) {
            req.body = {};
          } else {
            try {
              req.body = JSON.parse(body);
            } catch {
              throw new AppError("Invalid JSON payload", 400);
            }
          }
        }

        // ====================================================
        // 3. QUERY PARAM PARSING
        // ====================================================

        const fullUrl = new URL(req.url || "/", "http://localhost");

        req.query = Object.fromEntries(fullUrl.searchParams);

        // ====================================================
        // 4. ROUTING + MIDDLEWARE
        // ====================================================

        const handled = await router.handleRequest(req, res);

        // ====================================================
        // 5. FALLBACK (404)
        // ====================================================

        if (!handled) {
          this._sendJson(res, 404, {
            success: false,
            error: "Not Found",
          });
        }
      } catch (error) {
        logger.error({ err: error }, "Server Error!");
        this._sendError(res, error);
      }
    });
  }

  /**
   * Applies HTTP security headers to every response.
   *
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  _setSecurityHeaders(res) {
    res.setHeader("X-Content-Type-Options", "nosniff");

    res.setHeader("X-Frame-Options", "DENY");

    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );

    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join("; "),
    );
  }

  /**
   * Sends a JSON response.
   *
   * @param {import("http").ServerResponse} res
   * @param {number} statusCode
   * @param {object} payload
   * @returns {void}
   */
  _sendJson(res, statusCode, payload) {
    if (res.headersSent) {
      return;
    }

    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * Sends an error response.
   *
   * @param {import("http").ServerResponse} res
   * @param {Error & {statusCode?: number}} err
   * @returns {void}
   */
  _sendError(res, err) {
    if (res.headersSent) {
      return;
    }

    const statusCode =
      typeof err?.statusCode === "number" ? err.statusCode : 500;

    const message = statusCode >= 500 ? "Internal Server Error" : err.message;

    this._sendJson(res, statusCode, {
      success: false,
      error: message,
    });
  }

  /**
   * Attempts to serve a static file.
   *
   * @param {import("http").IncomingMessage} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<boolean>} True if handled.
   */
  async _serveStaticFiles(req, res) {
    if (!req.url) {
      return false;
    }

    if (req.url.startsWith("/.well-known")) {
      res.writeHead(410);
      res.end();

      return true;
    }

    const filePath = this._getSafePath(req.url);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext];

    if (!contentType || req.method !== "GET") {
      return false;
    }

    return this._serveStatic(res, filePath, contentType);
  }

  /**
   * Creates a safe filesystem path from a request URL.
   *
   * Helps prevent path traversal attacks.
   *
   * @param {string} requestUrl
   * @returns {string}
   */
  _getSafePath(requestUrl) {
    const resolved = path.resolve(this.staticFilePath, "." + requestUrl);

    if (!resolved.startsWith(this.staticFilePath)) {
      throw new AppError("Forbidden", 403);
    }

    return resolved;
  }

  /**
   * Serves a file from disk.
   *
   * @async
   * @param {import("http").ServerResponse} res
   * @param {string} filePath
   * @param {string} contentType
   * @returns {Promise<boolean>}
   */
  async _serveStatic(res, filePath, contentType) {
    try {
      const data = await fs.readFile(filePath);

      res.writeHead(200, {
        "Content-Type": contentType,
      });

      res.end(data);

      return true;
    } catch (error) {
      if (error.code !== "ENOENT") {
        logger.error({ err: error }, "Static file error!");
      }

      res.writeHead(404, {
        "Content-Type": "text/plain",
      });

      res.end("File not found");

      return true;
    }
  }
}

module.exports = App;
