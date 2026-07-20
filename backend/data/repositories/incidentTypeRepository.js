const BaseRepository = require("./baseRepository");

class IncidentTypeRepository extends BaseRepository {
  constructor() {
    super("incident_types");
  }

  findByName(name) {
    return this.db
      .prepare(
        `
        SELECT *
        FROM incident_types
        WHERE name = ?
      `,
      )
      .get(name);
  }
}

module.exports = new IncidentTypeRepository();
