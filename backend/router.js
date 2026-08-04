/**
 * ============================================================
 * Router
 * ============================================================
 *
 * Purpose:
 * - Matches incoming requests to routes
 * - Executes global middleware
 * - Executes route-specific middleware/handlers
 * - Handles errors centrally
 * ============================================================
 */

const authRoutes = require("./routes/authRoutes");
const viewRoutes = require("./routes/viewRoutes");
const incidentTypeRoutes = require("./routes/incidentTypeRoutes");
const planTemplateRoutes = require("./routes/planTemplateRoutes");
const planStageRoutes = require("./routes/planStageRoutes");
const planRoutes = require("./routes/planRoutes");
const roleRoutes = require("./routes/roleRoutes");
const planStageActionRoutes = require("./routes/planStageActionRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const incidentActionRoutes = require("./routes/incidentActionRoutes");
const incidentActionUpdateRoutes = require("./routes/incidentActionUpdateRoutes");
const userRoutes = require("./routes/userRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const userPreferenceRoutes = require("./routes/userPreferenceRoutes");
const eventRoutes = require("./routes/eventRoutes");

/**
 * Registered application routes.
 *
 * @type {Array<object>}
 */
const ROUTES = [
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
  ...userRoutes,
  ...auditLogRoutes,
  ...userPreferenceRoutes,
  ...eventRoutes,
];

/**
 * Router responsible for request routing,
 * middleware execution and error handling.
 */
class Router {
  constructor() {
    /**
     * Registered routes.
     *
     * @type {Array<object>}
     */
    this.routes = ROUTES;

    /**
     * Global middleware stack.
     *
     * @type {Function[]}
     */
    this.middlewares = [];
  }

  /**
   * Handles an incoming request.
   *
   * @param {import("http").IncomingMessage} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<boolean>}
   */
  async handleRequest(req, res) {
    try {
      const url = new URL(
        req.url || "/",
        `http://${req.headers.host || "localhost"}`,
      );

      const pathname = url.pathname.replace(/\/+$/, "") || "/";

      const middlewareResult = await this._runMiddlewares(req, res);

      if (middlewareResult === false) {
        return false;
      }

      if (middlewareResult !== true) {
        return this._handleError(middlewareResult, req, res);
      }

      const match = this._matchRoute(req.method, pathname);

      if (!match) {
        return false;
      }

      req.params = match.params;

      try {
        const handlers = Array.isArray(match.handler)
          ? match.handler
          : [match.handler];

        for (const handler of handlers) {
          await handler(req, res);
        }

        return true;
      } catch (error) {
        return this._handleError(error, req, res);
      }
    } catch (error) {
      return this._handleError(error, req, res);
    }
  }

  /**
   * Executes all registered global middleware.
   *
   * @param {import("http").IncomingMessage} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<boolean|Error>}
   */
  async _runMiddlewares(req, res) {
    for (const middleware of this.middlewares) {
      try {
        const result = await middleware(req, res);

        if (result === false) {
          return false;
        }
      } catch (error) {
        return error;
      }
    }

    return true;
  }

  /**
   * Registers a middleware function.
   *
   * @param {Function} fn
   * @returns {void}
   */
  use(fn) {
    this.middlewares.push(fn);
  }

  /**
   * Sends a standardised error response.
   *
   * @param {Error & {statusCode?: number}} error
   * @param {import("http").IncomingMessage} req
   * @param {import("http").ServerResponse} res
   * @returns {boolean}
   */
  _handleError(error, req, res) {
    console.error("Router Error:", error);

    if (res.headersSent) {
      return true;
    }

    const status =
      typeof error?.statusCode === "number" ? error.statusCode : 500;

    const message = error?.message ?? "Internal Server Error";

    res.writeHead(status, {
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        success: false,
        error: message,
      }),
    );

    return true;
  }

  /**
   * Matches a request to a route definition.
   *
   * Supports dynamic route parameters:
   * /users/:id
   *
   * @param {string} method
   * @param {string} pathname
   * @returns {{handler: Function|Function[], params: Object}|null}
   */
  _matchRoute(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }

      const routeParts = route.path.split("/").filter(Boolean);
      const urlParts = pathname.split("/").filter(Boolean);

      if (routeParts.length !== urlParts.length) {
        continue;
      }

      const params = {};
      let match = true;

      for (let i = 0; i < routeParts.length; i++) {
        const routePart = routeParts[i];
        const urlPart = urlParts[i];

        if (routePart.startsWith(":")) {
          params[routePart.slice(1)] = urlPart;
          continue;
        }

        if (routePart !== urlPart) {
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
