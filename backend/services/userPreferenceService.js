const userPreferenceRepository = require("../data/repositories/userPreferenceRepository");

class UserPreferenceService {
  /**
   * Merges and saves preferences.
   *
   * @param {number} userId
   * @param {object} updates
   * @returns {object}
   */
  _saveMergedPreferences(userId, updates) {
    const existing = this.getPreferences(userId);

    const preferences = {
      ...existing,
      ...updates,
    };

    userPreferenceRepository.save(userId, preferences);

    return preferences;
  }

  /**
   * Gets user preferences.
   *
   * @param {number} userId
   * @returns {object}
   */
  getPreferences(userId) {
    const row = userPreferenceRepository.getByUserId(userId);

    if (!row) {
      return {};
    }

    try {
      return JSON.parse(row.preferences);
    } catch {
      return {};
    }
  }

  /**
   * Updates user preferences.
   *
   * @param {number} userId
   * @param {object} updates
   * @returns {object}
   */
  updatePreferences(userId, updates) {
    return this._saveMergedPreferences(userId, updates);
  }

  /**
   * Saves user preferences.
   *
   * @param {number} userId
   * @param {object} updates
   * @returns {object}
   */
  savePreferences(userId, updates) {
    return this._saveMergedPreferences(userId, updates);
  }
}

module.exports = new UserPreferenceService();
