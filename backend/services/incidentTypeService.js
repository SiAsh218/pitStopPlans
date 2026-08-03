const incidentTypeRepository = require("../data/repositories/incidentTypeRepository");

class IncidentTypeService {
  /**
   * Converts a database row into an API DTO.
   *
   * @param {object} row
   * @returns {object}
   */
  _toDTO(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
    };
  }

  /**
   * Retrieves all incident types.
   *
   * @param {object} [options={}]
   * @returns {{rows: object[], meta: object}}
   */
  getAllIncidentTypes(options = {}) {
    const result = incidentTypeRepository.findAllWithQuery(options);

    return {
      rows: result.rows.map((row) => this._toDTO(row)),
      meta: result.meta,
    };
  }

  /**
   * Retrieves an incident type by ID.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getIncidentTypeById(id) {
    const row = incidentTypeRepository.findById(id);

    if (!row) {
      return null;
    }

    return this._toDTO(row);
  }

  /**
   * Creates a new incident type.
   *
   * @param {{name: string, description: string}} data
   * @returns {object}
   */
  createIncidentType(data) {
    const result = incidentTypeRepository.insert({
      name: data.name,
      description: data.description,
    });

    return {
      id: result.lastInsertRowid,
      name: data.name,
      description: data.description,
    };
  }

  /**
   * Updates an incident type.
   *
   * @param {number} id
   * @param {object} updates
   * @returns {object|null}
   */
  updateIncidentType(id, updates) {
    const row = incidentTypeRepository.findById(id);

    if (!row) {
      return null;
    }

    const updatedRow = {
      ...row,
      name: updates.name ?? row.name,
      description: updates.description ?? row.description,
    };

    incidentTypeRepository.updateById(id, {
      name: updatedRow.name,
      description: updatedRow.description,
    });

    return this._toDTO(updatedRow);
  }

  /**
   * Deletes an incident type.
   *
   * @param {number} id
   * @returns {boolean}
   */
  deleteIncidentType(id) {
    const existing = incidentTypeRepository.findById(id);

    if (!existing) {
      return false;
    }

    const result = incidentTypeRepository.deleteById(id);

    return result.changes > 0;
  }
}

module.exports = new IncidentTypeService();
