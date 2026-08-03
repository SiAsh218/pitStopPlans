const roleRepository = require("../data/repositories/roleRepository");

const AppError = require("../utils/AppError");

class RoleService {
  /**
   * Gets a role or throws.
   *
   * @param {number} id
   * @returns {object}
   */
  _getRoleOrThrow(id) {
    const role = roleRepository.findById(id);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    return role;
  }

  /**
   * Validates role name uniqueness.
   *
   * @param {string} name
   * @param {number} [excludeId]
   * @returns {void}
   */
  _validateUniqueRoleName(name, excludeId = null) {
    const existing = roleRepository.findByName(name);

    if (existing && (excludeId === null || existing.id !== excludeId)) {
      throw new AppError("Role already exists", 409);
    }
  }

  /**
   * Gets all roles.
   *
   * @param {object} [options={}]
   * @returns {object}
   */
  getAllRoles(options = {}) {
    return roleRepository.findAllWithQuery(options);
  }

  /**
   * Gets a role by ID.
   *
   * @param {number} id
   * @returns {object|null}
   */
  getRoleById(id) {
    return roleRepository.findById(id);
  }

  /**
   * Creates a role.
   *
   * @param {string} name
   * @returns {object}
   */
  createRole(name) {
    this._validateUniqueRoleName(name);

    const result = roleRepository.insert({
      name,
    });

    return roleRepository.findById(result.lastInsertRowid);
  }

  /**
   * Updates a role.
   *
   * @param {number} id
   * @param {object|string} data
   * @returns {object|null}
   */
  updateRole(id, data) {
    const role = roleRepository.findById(id);

    if (!role) {
      return null;
    }

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
      this._validateUniqueRoleName(fields.name, id);
    }

    roleRepository.updateById(id, fields);

    return roleRepository.findById(id);
  }

  /**
   * Deletes a role.
   *
   * @param {number} id
   * @returns {boolean}
   */
  deleteRole(id) {
    this._getRoleOrThrow(id);

    roleRepository.deleteById(id);

    return true;
  }
}

module.exports = new RoleService();
