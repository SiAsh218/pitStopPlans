const db = require("../db");

class UserRoleRepository {
  /**
   * Gets all roles assigned to a user.
   *
   * @param {number} userId
   * @returns {object[]}
   */
  findByUserId(userId) {
    return db
      .prepare(
        `
        SELECT
          r.id,
          r.name
        FROM user_roles ur
        INNER JOIN roles r
          ON r.id = ur.role_id
        WHERE ur.user_id = ?
        ORDER BY r.name
      `,
      )
      .all(userId);
  }

  /**
   * Removes all role assignments for a user.
   *
   * @param {number} userId
   * @returns {object}
   */
  deleteByUserId(userId) {
    return db
      .prepare(
        `
        DELETE FROM user_roles
        WHERE user_id = ?
      `,
      )
      .run(userId);
  }

  /**
   * Replaces all role assignments for a user.
   *
   * @param {number} userId
   * @param {number[]} roleIds
   */
  setRoles(userId, roleIds = []) {
    const currentRoleIds = db
      .prepare(
        `
      SELECT role_id
      FROM user_roles
      WHERE user_id = ?
      ORDER BY role_id
      `,
      )
      .all(userId)
      .map((row) => row.role_id);

    const newRoleIds = [...roleIds].map(Number).sort((a, b) => a - b);

    const rolesChanged =
      currentRoleIds.length !== newRoleIds.length ||
      currentRoleIds.some((roleId, index) => roleId !== newRoleIds[index]);

    if (!rolesChanged) {
      return;
    }

    const transaction = db.transaction(() => {
      this.deleteByUserId(userId);

      const stmt = db.prepare(`
      INSERT INTO user_roles
      (
        user_id,
        role_id
      )
      VALUES (?, ?)
    `);

      for (const roleId of newRoleIds) {
        stmt.run(userId, roleId);
      }

      db.prepare(
        `
        UPDATE users
        SET token_version = token_version + 1
        WHERE id = ?
        `,
      ).run(userId);
    });

    transaction();
  }
}

module.exports = new UserRoleRepository();
