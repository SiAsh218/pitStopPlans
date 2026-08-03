const BaseRepository = require("./baseRepository");

class UserRepository extends BaseRepository {
  constructor() {
    super("users");
  }

  /**
   * Finds a user by email.
   *
   * @param {string} email
   * @returns {object|undefined}
   */
  findByEmail(email) {
    return this.db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }

  /**
   * Creates a user.
   *
   * @param {string} email
   * @param {string} passwordHash
   * @param {string} role
   * @returns {object}
   */
  createUser(email, passwordHash, role) {
    const result = this.insert({
      email,
      password: passwordHash,
      role,
    });

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Updates a user.
   *
   * @param {number} userId
   * @param {object} updates
   * @returns {object|null}
   */
  updateUser(userId, updates) {
    const fields = {};

    if (updates.role !== undefined) {
      fields.role = updates.role;
    }

    if (updates.password !== undefined) {
      fields.password = updates.password;
    }

    if (!Object.keys(fields).length) {
      return this.findById(userId);
    }

    this.updateById(userId, fields);

    return this.findById(userId);
  }

  /**
   * Enables or disables a user.
   *
   * @param {number} userId
   * @param {boolean} active
   * @returns {object|null}
   */
  setActive(userId, active) {
    this.updateById(userId, {
      active: active ? 1 : 0,
    });

    return this.findById(userId);
  }
}

module.exports = new UserRepository();
