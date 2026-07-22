/**
 * ============================================================
 * View Controller (Server-Side Rendering Entry Layer)
 * ============================================================
 *
 * Purpose:
 * - Serves initial HTML pages to the browser
 * - Uses Template Engine to generate full HTML responses
 *
 * IMPORTANT ARCHITECTURAL NOTE:
 * ------------------------------------------------------------
 * This controller does NOT return sensitive or protected data.
 *
 * All protected data (e.g. trains) is now:
 *   ✅ Loaded via frontend (JavaScript)
 *   ✅ Fetched from API endpoints (/api/*)
 *   ✅ Secured using JWT authentication
 *
 * This file ONLY provides:
 *   - Base HTML structure
 *   - Basic UI flags / metadata
 *
 * This ensures:
 *   ✅ Security (no data leakage)
 *   ✅ Separation of concerns
 *   ✅ Modern frontend + API architecture
 * ============================================================
 */

const templateEngine = require("../templateEngine.js");
const AppError = require("../utils/AppError");

class ViewController {
  /**
   * ============================================================
   * Render HTML Template
   * ============================================================
   *
   * @param {import("http").ServerResponse} res
   * @param {string} templateName - Template filename (e.g. index.html)
   * @param {Object} data - Data passed to template
   * @param {number} statusCode - HTTP response status code
   *
   * Flow:
   * 1. Validate template name
   * 2. Generate final HTML using template engine
   * 3. Send HTML to browser
   */
  async render(res, templateName, data = {}, statusCode = 200) {
    if (!templateName) {
      throw new AppError("Template name is required", 400);
    }

    /**
     * Generate HTML from template + data
     */
    const html = await templateEngine.getFinalHTML(templateName, data);

    /**
     * Send response
     */
    res.writeHead(statusCode, { "Content-Type": "text/html" });
    res.end(html);
  }

  /**
   * ============================================================
   * Home Page Controller
   * ============================================================
   *
   * Route:
   *   GET /
   *
   * Responsibility:
   * - Serve the base HTML page
   * - Provide minimal UI context (NOT sensitive data)
   *
   * IMPORTANT:
   * ------------------------------------------------------------
   * We DO NOT fetch trains here anymore.
   *   Why?
   *
   * BEFORE (insecure / outdated pattern):
   *   const trains = trainService.getAllTrains();
   *   → Injected into HTML
   *
   * PROBLEM:
   *   ❌ Data exposed in page source
   *   ❌ Bypasses authentication
   *
   * NOW (correct approach):
   *   ✅ Frontend loads page
   *   ✅ User logs in
   *   ✅ Frontend fetches /api/trains with JWT
   *   ✅ Backend validates auth
   *   ✅ Data returned securely
   */
  async home(req, res) {
    /**
     * Minimal template data
     *
     * NOTE:
     * These values are safe to expose publicly
     */
    const data = {
      title: "Home",

      /**
       * Default UI state
       * (frontend will update this after login)
       */
      isLoggedIn: false,

      /**
       * Example UI flags (optional)
       */
      hasNotifications: false,

      /**
       * No user data initially
       * (frontend will populate after login)
       */
      user: null,
    };

    /**
     * Render homepage
     */
    return this.render(res, "home.html", data);
  }

  async login(req, res) {
    const data = {
      title: "Login",
      isLoggedIn: false,
    };
    return this.render(res, "login.html", data);
  }

  async createPlanTemplate(req, res) {
    const data = {
      title: "Create Plan Template",
      isLoggedIn: true,
      formMode: "new",
    };

    return this.render(res, "templates.html", data);
  }

  async planTemplate(req, res) {
    const data = {
      title: "Plan Template",
      isLoggedIn: true,
      formMode: "view",
    };

    return this.render(res, "plan-template.html", data);
  }

  async incident(req, res) {
    const data = {
      title: "Incident",
      isLoggedIn: true,
      formMode: "view",
    };
    return this.render(res, "incident.html", data);
  }

  async createIncident(req, res) {
    const data = {
      title: "Create Incident",
      isLoggedIn: true,
      formMode: "new",
    };
    return this.render(res, "create-incident.html", data);
  }
}

module.exports = new ViewController();
