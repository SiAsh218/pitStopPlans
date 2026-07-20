/**
 * ============================================================
 * Router
 * ============================================================
 *
 * Purpose:
 * - Matches incoming requests to routes
 * - Executes global middleware (router.use)
 * - Executes route-specific middleware/handlers
 * - Handles errors centrally
 *
 * Responsibilities:
 * Route matching (method + path)
 * Parameter extraction (e.g. /:id)
 * Middleware pipeline execution
 * Controller execution
 * Error handling
 *
 * This acts as the core of the backend framework.
 * ============================================================
 */

const authRoutes = require("./routes/authRoutes.js");
const viewRoutes = require("./routes/viewRoutes.js");
const incidentTypeRoutes = require("./routes/incidentTypeRoutes.js");
const planTemplateRoutes = require("./routes/planTemplateRoutes.js");
const planStageRoutes = require("./routes/planStageRoutes.js");
const planRoutes = require("./routes/planRoutes.js");
const roleRoutes = require("./routes/roleRoutes.js");
const planStageActionRoutes = require("./routes/planStageActionRoutes.js");
const incidentRoutes = require("./routes/incidentRoutes.js");
const incidentActionRoutes = require("./routes/incidentActionRoutes.js");
const incidentActionUpdateRoutes = require("./routes/incidentActionUpdateRoutes.js");

/**
 * Router class
 * Handles incoming requests and maps them to the correct handler
 */
class Router {
  constructor() {
    /**
     * ============================================================
     * Route Definitions
     * ============================================================
     *
     * Each route defines:
     * - method → HTTP method (GET, POST, etc.)
     * - path → URL path (supports dynamic params)
     * - handler → function OR array of middleware/functions
     *
     * Handlers can be:
     * - single function
     * - array [middleware, middleware, controller]
     */
    this.routes = [
      ...authRoutes,
      ...viewRoutes,
      ...incidentTypeRoutes,
      ...planTemplateRoutes,
      ...planStageRoutes,
      ...planRoutes,
      ...roleRoutes,
      ...planStageActionRoutes,
      ...incidentRoutes,
      ...incidentActionRoutes,
      ...incidentActionUpdateRoutes,
    ];

    /**
     * ============================================================
     * Global Middleware Stack
     * ============================================================
     *
     * Middleware registered via:
     *   router.use(fn) in app.js
     *
     * These run BEFORE route matching
     */
    this.middlewares = [];
  }

  /**
   * ============================================================
   * Main Request Handler
   * ============================================================
   *
   * Flow:
   * 1. Parse URL + pathname
   * 2. Run global middleware
   * 3. Match route
   * 4. Execute route middleware/handlers
   * 5. Handle errors
   */
  async handleRequest(req, res) {
    try {
      const url = new URL(
        req.url || "/",
        `http://${req.headers.host || "localhost"}`,
      );

      const pathname = url.pathname.replace(/\/+$/, "") || "/";

      /**
       * ========================================================
       * 1. Run Global Middleware
       * ========================================================
       */
      const middlewareResult = await this._runMiddlewares(req, res);

      if (middlewareResult !== true) {
        return this._handleError(middlewareResult, req, res);
      }

      /**
       * ========================================================
       * 2. Match Route
       * ========================================================
       */
      const match = this._matchRoute(req.method, pathname);

      if (match) {
        /**
         * Attach route parameters to request
         * Example: /trains/1 → req.params.id = "1"
         */
        req.params = match.params;

        try {
          /**
           * Support both:
           * - single handler
           * - array of handlers (middleware chain)
           */
          const handlers = Array.isArray(match.handler)
            ? match.handler
            : [match.handler];

          /**
           * ====================================================
           * 3. Execute Handler Chain
           * ====================================================
           */
          for (const fn of handlers) {
            await fn(req, res);
          }

          return true;
        } catch (err) {
          return this._handleError(err, req, res);
        }
      }

      /**
       * ========================================================
       * 4. No Route Matched
       * ========================================================
       */
      return false;
    } catch (err) {
      return this._handleError(err, req, res);
    }
  }

  /**
   * ============================================================
   * Execute Global Middleware Stack
   * ============================================================
   *
   * Runs middleware in order of registration
   */
  async _runMiddlewares(req, res) {
    for (const middleware of this.middlewares) {
      try {
        const result = await middleware(req, res);

        /**
         * Middleware can stop execution by returning false
         */
        if (result === false) {
          return false;
        }
      } catch (err) {
        return err;
      }
    }

    return true;
  }

  /**
   * ============================================================
   * Register Middleware
   * ============================================================
   *
   * Adds middleware to global stack
   */
  use(fn) {
    this.middlewares.push(fn);
  }

  /**
   * ============================================================
   * Central Error Handler
   * ============================================================
   *
   * Ensures all errors return consistent JSON responses
   */
  _handleError(err, req, res) {
    console.error("💥 Error:", err);

    const status = err.statusCode || 500;

    res.writeHead(status, { "Content-Type": "application/json" });

    res.end(
      JSON.stringify({
        success: false,
        error: err.message || "Internal Server Error",
      }),
    );

    return true;
  }

  /**
   * ============================================================
   * Route Matching (supports dynamic params)
   * ============================================================
   *
   * Example:
   * /api/trains/:id
   *
   * Matches:
   * /api/trains/5 → { id: "5" }
   */
  _matchRoute(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      const routeParts = route.path.split("/").filter(Boolean);
      const urlParts = pathname.split("/").filter(Boolean);

      if (routeParts.length !== urlParts.length) continue;

      const params = {};
      let match = true;

      for (let i = 0; i < routeParts.length; i++) {
        const routePart = routeParts[i];
        const urlPart = urlParts[i];

        if (routePart.startsWith(":")) {
          /**
           * Dynamic param
           */
          const key = routePart.slice(1);
          params[key] = urlPart;
        } else if (routePart !== urlPart) {
          match = false;
          break;
        }
      }

      if (match) {
        return {
          handler: route.handler,
          params,
        };
      }
    }

    return null;
  }
}

module.exports = new Router();
