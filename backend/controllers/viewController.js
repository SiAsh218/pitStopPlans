/**
 * ============================================================
 * View Controller (Server-Side Rendering Entry Layer)
 * ============================================================
 *
 * Purpose:
 * - Serves initial HTML pages to the browser
 * - Uses Template Engine to generate full HTML responses
 * ============================================================
 */

const templateEngine = require("../templateEngine");
const AppError = require("../utils/AppError");

/**
 * Handles view rendering requests.
 */
class ViewController {
  constructor() {
    this.home = this.home.bind(this);
    this.login = this.login.bind(this);
    this.createPlanTemplate = this.createPlanTemplate.bind(this);
    this.users = this.users.bind(this);
    this.roles = this.roles.bind(this);
    this.auditLog = this.auditLog.bind(this);
    this.planTemplate = this.planTemplate.bind(this);
    this.incident = this.incident.bind(this);
    this.createIncident = this.createIncident.bind(this);
  }

  /**
   * Renders a template and sends the HTML response.
   *
   * @param {import("http").ServerResponse} res
   * @param {string} templateName
   * @param {object} [data={}]
   * @param {number} [statusCode=200]
   * @returns {Promise<void>}
   */
  async _render(res, templateName, data = {}, statusCode = 200) {
    if (!templateName) {
      throw new AppError("Template name is required", 400);
    }

    const html = await templateEngine.getFinalHTML(templateName, data);

    res.writeHead(statusCode, {
      "Content-Type": "text/html",
    });

    res.end(html);
  }

  /**
   * Render home page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async home(req, res) {
    return this._render(res, "home.html", {
      title: "Home",
      isLoggedIn: false,
      hasNotifications: false,
      user: null,
    });
  }

  /**
   * Render login page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async login(req, res) {
    return this._render(res, "login.html", {
      title: "Login",
      isLoggedIn: false,
    });
  }

  /**
   * Render create plan template page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async createPlanTemplate(req, res) {
    return this._render(res, "templates.html", {
      title: "Create Plan Template",
      isLoggedIn: true,
      formMode: "new",
    });
  }

  /**
   * Render user management page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async users(req, res) {
    return this._render(res, "users.html", {
      title: "User Management",
      isLoggedIn: true,
    });
  }

  /**
   * Render roles page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async roles(req, res) {
    return this._render(res, "roles.html", {
      title: "Operational Roles",
      isLoggedIn: true,
    });
  }

  /**
   * Render audit log page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async auditLog(req, res) {
    return this._render(res, "audit.html", {
      title: "Audit Log",
      isLoggedIn: true,
    });
  }

  /**
   * Render plan template page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async planTemplate(req, res) {
    return this._render(res, "plan-template.html", {
      title: "Plan Template",
      isLoggedIn: true,
      formMode: "view",
    });
  }

  /**
   * Render incident page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async incident(req, res) {
    return this._render(res, "incident.html", {
      title: "Incident",
      isLoggedIn: true,
      formMode: "view",
    });
  }

  /**
   * Render create incident page.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {Promise<void>}
   */
  async createIncident(req, res) {
    return this._render(res, "create-incident.html", {
      title: "Create Incident",
      isLoggedIn: true,
      formMode: "new",
    });
  }
}

module.exports = new ViewController();
