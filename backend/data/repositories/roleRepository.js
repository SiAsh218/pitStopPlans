const BaseRepository = require("./baseRepository");

class RoleRepository extends BaseRepository {
  constructor() {
    super("roles");
  }

  findByName(name) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM roles
        WHERE name = ?
      `,
      )
      .get(name);
  }
}

module.exports = new RoleRepository();
