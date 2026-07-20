const roleRepository = require("../data/repositories/roleRepository");

const AppError = require("../utils/AppError");

class RoleService {
  getAllRoles() {
    return roleRepository.findAll();
  }

  getRoleById(id) {
    return roleRepository.findById(id);
  }

  createRole(name) {
    const existing = roleRepository.findByName(name);

    if (existing) {
      throw new AppError("Role already exists", 409);
    }

    const result = roleRepository.insert({
      name,
    });

    return roleRepository.findById(result.lastInsertRowid);
  }
}

module.exports = new RoleService();
