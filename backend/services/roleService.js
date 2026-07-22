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

  updateRole(id, name) {
    const existing = roleRepository.findByName(name);

    if (existing && existing.id !== id) {
      throw new AppError("Role already exists", 409);
    }

    roleRepository.updateById(id, {
      name,
    });

    return roleRepository.findById(id);
  }

  deleteRole(id) {
    const role = roleRepository.findById(id);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    roleRepository.deleteById(id);
  }
}

module.exports = new RoleService();
