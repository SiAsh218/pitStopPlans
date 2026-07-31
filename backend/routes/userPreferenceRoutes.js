const auth = require("../middleware/auth");

const requireRole = require("../middleware/role");

const userPreferenceController = require("../controllers/userPreferenceController");

module.exports = [
  /**
   * Get current user's preferences
   */
  {
    method: "GET",
    path: "/api/me/preferences",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      userPreferenceController.getPreferences.bind(userPreferenceController),
    ],
  },

  /**
   * Save preferences
   */
  {
    method: "PUT",
    path: "/api/me/preferences",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      userPreferenceController.savePreferences.bind(userPreferenceController),
    ],
  },
];
