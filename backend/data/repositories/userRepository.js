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
    this.db
      .prepare(
        `
      UPDATE users
      SET
        active = ?,
        token_version = token_version + 1
      WHERE id = ?
      `,
      )
      .run(active ? 1 : 0, userId);

    return this.findById(userId);
  }

  findAllWithQuery(options = {}) {
    const limit = Math.max(1, Math.min(Number(options.limit) || 25, 200));

    const page = Math.max(1, Number(options.page) || 1);

    const offset = (page - 1) * limit;

    const clauses = [];
    const params = [];

    if (options.appRole) {
      clauses.push("users.role = ?");
      params.push(options.appRole);
    }

    if (options.active === "active") {
      clauses.push("users.active = 1");
    }

    if (options.active === "disabled") {
      clauses.push("users.active = 0");
    }

    if (options.jobRole) {
      clauses.push("roles.name = ?");
      params.push(options.jobRole);
    }

    if (options.search) {
      clauses.push(`
    (
      users.email LIKE ?
      OR users.role LIKE ?
      OR roles.name LIKE ?
    )
  `);

      params.push(
        `%${options.search}%`,
        `%${options.search}%`,
        `%${options.search}%`,
      );
    }

    const whereClause =
      clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

    const sql = `
    SELECT DISTINCT users.*
    FROM users
    LEFT JOIN user_roles
      ON user_roles.user_id = users.id
    LEFT JOIN roles
      ON roles.id = user_roles.role_id
    ${whereClause}
    ORDER BY users.email ASC
    LIMIT ?
    OFFSET ?
  `;

    const rows = this.db.prepare(sql).all(...params, limit, offset);

    const countResult = this.db
      .prepare(
        `
      SELECT COUNT(DISTINCT users.id) AS total
      FROM users
      LEFT JOIN user_roles
        ON user_roles.user_id = users.id
      LEFT JOIN roles
        ON roles.id = user_roles.role_id
      ${whereClause}
    `,
      )
      .get(...params);

    const total = countResult?.total || 0;

    return {
      rows,
      meta: {
        total,
        limit,
        offset,
        page,
        pageCount: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new UserRepository();
