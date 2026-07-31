const userPreferenceRepository = require("../data/repositories/userPreferenceRepository");

class UserPreferenceService {
  getPreferences(userId) {
    const row = userPreferenceRepository.getByUserId(userId);

    if (!row) {
      return {};
    }

    return JSON.parse(row.preferences);
  }

  updatePreferences(userId, updates) {
    const existing = this.getPreferences(userId);

    const preferences = {
      ...existing,
      ...updates,
    };

    userPreferenceRepository.save(userId, preferences);

    return preferences;
  }

  savePreferences(userId, updates) {
    const existing = this.getPreferences(userId);

    const preferences = {
      ...existing,
      ...updates,
    };

    userPreferenceRepository.save(userId, preferences);

    return preferences;
  }
}

module.exports = new UserPreferenceService();
