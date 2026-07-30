const db = require("../db");

class UserRoleRepository {
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
      `,
      )
      .all(userId);
  }

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

  setRoles(userId, roleIds) {
    this.deleteByUserId(userId);

    const stmt = db.prepare(`
      INSERT INTO user_roles
      (
        user_id,
        role_id
      )
      VALUES (?, ?)
    `);

    for (const roleId of roleIds) {
      stmt.run(userId, roleId);
    }
  }
}

module.exports = new UserRoleRepository();
