const userPreferenceService = require("../services/userPreferenceService");

/**
 * Handles user preference HTTP requests.
 */
class UserPreferenceController {
  constructor() {
    this.getPreferences = this.getPreferences.bind(this);
    this.savePreferences = this.savePreferences.bind(this);
  }

  /**
   * Sends a JSON response.
   *
   * @param {import("http").ServerResponse} res
   * @param {number} statusCode
   * @param {object} payload
   * @returns {void}
   */
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  /**
   * Gets the current user's preferences.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  getPreferences(req, res) {
    const preferences = userPreferenceService.getPreferences(req.user.id);

    this._sendJSON(res, 200, {
      success: true,
      data: preferences,
    });
  }

  /**
   * Saves the current user's preferences.
   *
   * @param {object} req
   * @param {import("http").ServerResponse} res
   * @returns {void}
   */
  savePreferences(req, res) {
    const preferences = userPreferenceService.savePreferences(
      req.user.id,
      req.body,
    );

    this._sendJSON(res, 200, {
      success: true,
      data: preferences,
    });
  }
}

module.exports = new UserPreferenceController();
