const BaseRepository = require("./baseRepository");

class UserPreferenceRepository extends BaseRepository {
  constructor() {
    super("user_preferences");
  }

  getByUserId(userId) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM user_preferences
        WHERE user_id = ?
      `,
      )
      .get(userId);
  }

  save(userId, preferences) {
    return this.db
      .prepare(
        `
        INSERT INTO user_preferences (
          user_id,
          preferences,
          updated_at
        )
        VALUES (
          ?,
          ?,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT(user_id)
        DO UPDATE SET
          preferences = excluded.preferences,
          updated_at = CURRENT_TIMESTAMP
      `,
      )
      .run(userId, JSON.stringify(preferences));
  }
}

module.exports = new UserPreferenceRepository();
