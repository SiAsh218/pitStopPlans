const userPreferenceService = require("../services/userPreferenceService");

class UserPreferenceController {
  _sendJSON(res, statusCode, payload) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
    });

    res.end(JSON.stringify(payload));
  }

  getPreferences(req, res) {
    const preferences = userPreferenceService.getPreferences(req.user.id);

    this._sendJSON(res, 200, {
      success: true,
      data: preferences,
    });
  }

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
