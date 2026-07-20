/**
 * ============================================================
 * Lightweight HTML Template Engine
 * ============================================================
 *
 * Purpose:
 * - Converts HTML templates into final rendered HTML
 * - Injects dynamic data into templates
 *
 * Features:
 * ✅ Variable interpolation ({{key}})
 * ✅ Nested object access ({{user.name}})
 * ✅ Conditionals ({{if_key}} ... {{else}} ... {{/if_key}})
 * ✅ Array loops ({{items_template}} ... {{/items_template}})
 * ✅ Partials / includes ({{include_header}})
 *
 * Security:
 * ✅ Escapes HTML output to prevent XSS attacks
 *
 * Usage:
 *   templateEngine.getFinalHTML("index.html", data)
 *
 * ============================================================
 */

const fs = require("fs").promises;
const config = require("../config.json");

class TemplateEngine {
  /**
   * ============================================================
   * Constructor
   * ============================================================
   *
   * Initialises paths and cache
   */
  constructor() {
    /**
     * Directory containing main view templates
     */
    this.viewPath = config.paths.views;

    /**
     * Directory containing partial templates (headers, footers etc.)
     */
    this.partialsPath = config.paths.partials;

    /**
     * Cache for partial templates
     * Prevents repeated file reads (performance optimisation)
     */
    this._partialsCache = new Map();
  }

  // =========================
  // Public API
  // =========================

  /**
   * ============================================================
   * Generate final HTML from template + data
   * ============================================================
   *
   * Flow:
   * 1. Load template file from disk
   * 2. Load and inject partials
   * 3. Process template placeholders and logic
   *
   * @param {string} templateName
   * @param {Object} data
   * @returns {Promise<string>}
   */
  async getFinalHTML(templateName, data) {
    try {
      if (!this.viewPath) {
        throw new Error("viewPath is not set");
      }

      /**
       * Load template file
       */
      const fullPath = `${this.viewPath}/${templateName}`;
      let template = await fs.readFile(fullPath, "utf8");

      /**
       * Load partials (e.g. {{include_header}})
       */
      const partials = await this._getPartials(template);

      /**
       * Replace include placeholders with actual partial content
       */
      template = this._replaceIncludes(template, partials);

      /**
       * Convert template to final HTML
       */
      return this._convertTemplate(template, data);
    } catch (err) {
      console.error("TemplateEngine Error:", err);
      throw err;
    }
  }

  // =========================
  // Core renderer
  // =========================

  /**
   * ============================================================
   * Convert template into final HTML
   * ============================================================
   *
   * Processes:
   * - Nested object placeholders
   * - Arrays (loops)
   * - Booleans (conditionals)
   * - Simple values
   */
  _convertTemplate(template, data) {
    if (!data) return template;

    /**
     * Process nested placeholders first (e.g. {{user.name}})
     */
    template = this._replaceObjectPlaceholders(template, data);

    /**
     * Iterate through top-level keys
     */
    for (const key in data) {
      const value = data[key];

      if (Array.isArray(value)) {
        template = this._handleArray(template, key, value);
      } else if (typeof value === "boolean") {
        template = this._handleBoolean(template, key, value);
      } else if (typeof value !== "object") {
        template = this._replacePlaceholders(template, key, value);
      }
    }

    return template;
  }

  // =========================
  // Arrays (loops)
  // =========================

  /**
   * ============================================================
   * Handle array templates
   * ============================================================
   *
   * Example:
   * {{trains_template}}
   *   <div>{{name}}</div>
   * {{/trains_template}}
   *
   * Renders one block per item in array
   */
  _handleArray(template, key, array) {
    const escapedKey = this._escapeRegex(key);

    const regex = new RegExp(
      `{{${escapedKey}_template}}([\\s\\S]*?){{/${escapedKey}_template}}`,
      "g",
    );

    return template.replace(regex, (_, itemTemplate) => {
      return array
        .map((item) => this._convertTemplate(itemTemplate, item))
        .join("");
    });
  }

  // =========================
  // Conditionals
  // =========================

  /**
   * ============================================================
   * Handle boolean conditionals
   * ============================================================
   *
   * Example:
   * {{if_loggedIn}}
   *   Welcome!
   * {{else}}
   *   Please log in
   * {{/if_loggedIn}}
   */
  _handleBoolean(template, key, value) {
    const escapedKey = this._escapeRegex(key);

    const regex = new RegExp(
      `{{if_${escapedKey}}}([\\s\\S]*?){{/if_${escapedKey}}}`,
      "g",
    );

    return template.replace(regex, (_, content) => {
      const [ifPart, elsePart] = content.split("{{else}}");

      return value ? (ifPart || "").trim() : (elsePart || "").trim();
    });
  }

  // =========================
  // Basic placeholders
  // =========================

  /**
   * Replace simple placeholders
   *
   * Example:
   * {{title}} → "Dashboard"
   */
  _replacePlaceholders(template, key, value) {
    const escapedKey = this._escapeRegex(key);

    return template.replace(
      new RegExp(`{{${escapedKey}}}`, "g"),
      this._escapeHTML(value),
    );
  }

  // =========================
  // Nested object placeholders
  // =========================

  /**
   * ============================================================
   * Replace nested object values
   * ============================================================
   *
   * Example:
   * {{user.name}} → "Simon"
   */
  _replaceObjectPlaceholders(template, data) {
    return template.replace(/{{(\w+(?:\.\w+)*)}}/g, (match, path) => {
      const keys = path.split(".");
      let value = data;

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }

      return value !== undefined ? this._escapeHTML(value) : match;
    });
  }

  // =========================
  // Partials (includes)
  // =========================

  /**
   * Load all partials used in template
   */
  async _getPartials(template) {
    const names = this._getPartialNames(template);

    const partials = [];

    for (const name of names) {
      const content = await this._getIncludeInfo(name);
      partials.push({ name, content });
    }

    return partials;
  }

  /**
   * Get partial content from cache or disk
   */
  async _getIncludeInfo(name) {
    if (this._partialsCache.has(name)) {
      return this._partialsCache.get(name);
    }

    const path = `${this.partialsPath}/${name}.html`;

    try {
      const content = await fs.readFile(path, "utf8");

      /**
       * Cache the partial for reuse
       */
      this._partialsCache.set(name, content);

      return content;
    } catch (err) {
      console.error(`Error loading partial: ${name}`, err);
      return "";
    }
  }

  /**
   * Extract partial names from template
   *
   * Example:
   * {{include_header}} → "header"
   */
  _getPartialNames(template) {
    const matches = template.match(/{{include_(.*?)}}/g);

    if (!matches) return [];

    return matches.map((match) => match.replace(/{{include_|}}/g, "").trim());
  }

  /**
   * Replace include placeholders with partial content
   */
  _replaceIncludes(template, partials) {
    return template.replace(/{{include_(.*?)}}/g, (_, name) => {
      const partial = partials.find((p) => p.name === name.trim());

      return partial ? partial.content : "";
    });
  }

  // =========================
  // Utilities
  // =========================

  /**
   * Escape regex characters (prevents regex errors)
   */
  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Escape HTML to prevent XSS attacks
   *
   * Example:
   * "<script>" → "&lt;script&gt;"
   */
  _escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}

/**
 * Export a singleton instance
 *
 * Ensures:
 * ✅ Shared cache
 * ✅ Single instance across app
 */
module.exports = new TemplateEngine();
