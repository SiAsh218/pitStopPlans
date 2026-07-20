const incidentTypeRepository = require("../data/repositories/incidentTypeRepository");

class IncidentTypeService {
  constructor() {}

  getAllIncidentTypes() {
    const rows = incidentTypeRepository.findAll();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
    }));
  }

  getIncidentTypeById(id) {
    const row = incidentTypeRepository.findById(id);

    /**
     * Return null if not found (controller handles error)
     */
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
    };
  }

  createIncidentType(data) {
    /**
     * Convert API structure → DB structure
     */
    const result = incidentTypeRepository.insert({
      name: data.name,
      description: data.description,
    });

    /**
     * Return API representation of new incident type
     */
    return {
      id: result.lastInsertRowid,
      name: data.name,
      description: data.description,
    };
  }

  updateIncidentType(id, updates) {
    const row = incidentTypeRepository.findById(id);

    if (!row) return null;

    const updatedData = {
      name: updates.name ?? row.name,
      description: updates.description ?? row.description,
    };

    /**
     * Update database
     */
    incidentTypeRepository.updateById(id, {
      name: updatedData.name,
      description: updatedData.description,
    });

    /**
     * Return updated object in API format
     */
    return {
      id,
      name: updatedData.name,
      description: updatedData.description,
    };
  }

  deleteIncidentType(id) {
    /**
     * Check existence first
     */
    const existing = incidentTypeRepository.findById(id);

    if (!existing) return false;

    /**
     * Delete from DB
     */
    const result = incidentTypeRepository.deleteById(id);

    /**
     * result.changes indicates rows affected
     */
    return result.changes > 0;
  }
}

module.exports = new IncidentTypeService();
