/**
 * ============================================================
 * Main Application Class
 * ============================================================
 *
 * Purpose:
 * - Creates and configures the HTTP server
 * - Wires middleware, routing, and static file serving together
 * - Handles request lifecycle (from incoming request → response)
 *
 * High-Level Flow:
 * 1. Incoming request
 * 2. Attempt to serve static files
 * 3. Parse request body (for POST/PUT)
 * 4. Parse query parameters
 * 5. Pass request through router + middleware
 * 6. Send response or fallback (404 / 500)
 * ============================================================
 */

const config = require("../config.json");
require("dotenv").config();

const http = require("http");
const path = require("path");
const fs = require("fs").promises;

// Custom router (handles routes and middleware chain)
const router = require("./router.js");
const AppError = require("./utils/AppError.js");

// =========================
// Middleware Registration
// =========================

/**
 * Middleware responsibilities:
 * - logger → logs requests
 * - requireJSON → validates JSON requests
 * - validateTrain → validates train data
 *
 * ORDER MATTERS:
 * Middleware runs in the order registered here
 */
const logger = require("./middleware/logger");
// const timer = require("./middleware/timer.js");
const requireJSON = require("./middleware/requireJSON.js");
const validateTrain = require("./middleware/validateTrain.js");

router.use(logger);
// router.use(timer);
router.use(requireJSON);
// router.use(validateTrain);

// =========================
// Database Initialisation
// =========================

/**
 * Responsible for:
 * - Creating tables if they don't exist
 * - Seeding initial data (e.g. admin user)
 */
const initialiseDatabase = require("./data/init");
const seedDatabase = require("./data/seed");

// =========================
// MIME Types (for static files)
// =========================
const MIME_TYPES = config.mimeTypes || {};

class App {
  /**
   * Creates a new App instance
   *
   * @param {{ port: number }} options
   */
  constructor({ port }) {
    this.port = port;

    /**
     * Current environment (development / production)
     */
    this.mode = process.env.NODE_ENV || "development";

    /**
     * Absolute path to static frontend directory
     */
    this.staticFilePath = path.join(__dirname, "..", config.paths.static);

    this.server = null;
    this.host = null;

    // Initialise DB on startup
    try {
      initialiseDatabase();
      seedDatabase();
    } catch (error) {
      console.error("Database startup failed:", error.message || error);
    }
  }

  /**
   * Start the HTTP server
   *
   * - Determines environment
   * - Creates HTTP server
   * - Starts listening on configured port
   */
  async start() {
    try {
      if (this.mode === "production") {
        this.runHTTP("production");
      } else {
        this.runHTTP("development");
      }

      await this._listenWithRetry(this.port, this.host);
    } catch (error) {
      console.error("Application startup failed:", error);
      process.exit(1);
    }
  }

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

        console.log(
          `Server running (${this.mode}) on http://${host}:${this.port}`,
        );
        return;
      } catch (error) {
        if (error.code !== "EADDRINUSE") {
          throw error;
        }

        attempt += 1;

        if (attempt >= maxAttempts) {
          throw error;
        }

        currentPort += 1;
        console.warn(`Port ${port} is in use, trying ${currentPort}...`);
      }
    }
  }

  /**
   * Initialise HTTP server and define request handler
   *
   * @param {"development"|"production"} mode
   */
  runHTTP(mode) {
    this.mode = mode;

    /**
     * Select host depending on environment
     */
    this.host = mode === "production" ? config.prod.ip : config.dev.ip;

    /**
     * Create HTTP server
     */
    this.server = http.createServer(async (req, res) => {
      try {
        // ====================================================
        // 1. STATIC FILE HANDLING
        // ====================================================
        const isStatic = await this._serveStaticFiles(req, res);

        if (isStatic) return;

        // ====================================================
        // 2. BODY PARSING (POST / PUT)
        // ====================================================
        if (req.method === "POST" || req.method === "PUT") {
          let body = "";

          // Read request stream
          for await (const chunk of req) {
            body += chunk.toString();
          }

          // Parse JSON body
          if (body.trim().length === 0) {
            req.body = {};
          } else {
            try {
              req.body = JSON.parse(body);
            } catch (err) {
              throw new AppError("Invalid JSON payload", 400);
            }
          }
        }

        // ====================================================
        // 3. QUERY PARAM PARSING
        // ====================================================
        const fullUrl = new URL(req.url, `http://${req.headers.host}`);

        /**
         * Convert query string → object
         * Example: ?status=delayed → { status: "delayed" }
         */
        req.query = Object.fromEntries(fullUrl.searchParams);

        // ====================================================
        // 4. ROUTING + MIDDLEWARE
        // ====================================================
        const handled = await router.handleRequest(req, res);

        // ====================================================
        // 5. FALLBACK (404)
        // ====================================================
        if (!handled) {
          this._sendJson(res, 404, { success: false, error: "Not Found" });
        }
      } catch (err) {
        // ====================================================
        // GLOBAL REQUEST ERROR HANDLER
        // ====================================================
        console.error("Server Error:", err);
        this._sendError(res, err);
      }
    });
  }

  _sendJson(res, statusCode, payload) {
    if (res.headersSent) {
      return;
    }

    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  }

  _sendError(res, err) {
    if (res.headersSent) {
      return;
    }

    const statusCode =
      err && typeof err.statusCode === "number" ? err.statusCode : 500;
    const message = err && err.message ? err.message : "Internal Server Error";

    this._sendJson(res, statusCode, {
      success: false,
      error: message,
    });
  }

  /**
   * Attempt to serve static files (CSS, JS, HTML, etc.)
   *
   * @param {import("http").IncomingMessage} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<boolean>} true if handled
   */
  async _serveStaticFiles(req, res) {
    if (!req.url) return false;

    /**
     * Block certain system paths (security precaution)
     */
    if (req.url.startsWith("/.well-known")) {
      res.writeHead(410);
      res.end();
      return true;
    }

    // Resolve safe file path
    const filePath = this._getSafePath(req.url);

    const ext = path.extname(filePath);

    const contentType = MIME_TYPES[ext];

    /**
     * Only serve GET requests for known file types
     */
    if (!contentType || req.method !== "GET") {
      return false;
    }

    return this._serveStatic(res, filePath, contentType);
  }

  /**
   * Prevent path traversal attacks
   *
   * Example attack:
   *   ../../etc/passwd
   *
   * @param {string} requestUrl
   * @returns {string} safe absolute path
   */
  _getSafePath(requestUrl) {
    let safePath = path.normalize(requestUrl).replace(/^(\.\.[\/\\])+/, "");

    /**
     * Default to home.html if directory requested
     */
    if (safePath.endsWith("/")) {
      safePath += "src/html/home.html";
    }

    return path.join(this.staticFilePath, safePath);
  }

  /**
   * Serve file from disk
   *
   * @param {import("http").ServerResponse} res
   * @param {string} filePath
   * @param {string} contentType
   */
  async _serveStatic(res, filePath, contentType) {
    try {
      const data = await fs.readFile(filePath);

      res.writeHead(200, { "Content-Type": contentType });

      res.end(data);

      return true;
    } catch (error) {
      /**
       * Ignore file-not-found logs for normal 404s
       */
      if (error.code !== "ENOENT") {
        console.error("Static file error:", error);
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("File not found");

      return true;
    }
  }
}

module.exports = App;
