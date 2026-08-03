const roleRepository = require("../data/repositories/roleRepository");

const AppError = require("../utils/AppError");

class RoleService {
  getAllRoles(options = {}) {
    return roleRepository.findAllWithQuery(options);
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

  updateRole(id, data) {
    const fields =
      typeof data === "string"
        ? { name: data }
        : {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.active !== undefined
              ? { active: data.active ? 1 : 0 }
              : {}),
          };

    if (!Object.keys(fields).length) {
      throw new AppError("No role changes provided", 400);
    }

    if (fields.name) {
      const existing = roleRepository.findByName(fields.name);

      if (existing && existing.id !== id) {
        throw new AppError("Role already exists", 409);
      }
    }

    roleRepository.updateById(id, fields);

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
