const bcrypt = require("bcrypt");

const userRepository = require("../data/repositories/userRepository");
const userRoleRepository = require("../data/repositories/userRoleRepository");
const roleRepository = require("../data/repositories/roleRepository");

const auditService = require("../services/auditLogService");
const { validatePassword } = require("../utils/validatePassword");

const AppError = require("../utils/AppError");

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_SALT || 10);

class UserService {
  /**
   * Converts a user record into a safe DTO.
   *
   * @param {object} user
   * @returns {object}
   */
  _toDTO(user) {
    const { password: _password, ...safeUser } = user;

    return {
      ...safeUser,
      job_roles: userRoleRepository.findByUserId(user.id),
    };
  }

  /**
   * Gets a user or throws.
   *
   * @param {number} userId
   * @returns {object}
   */
  _getUserOrThrow(userId) {
    const user = userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  /**
   * Validates role IDs.
   *
   * @param {number[]} roleIds
   * @returns {void}
   */
  _validateRoles(roleIds = []) {
    for (const roleId of roleIds) {
      const role = roleRepository.findById(roleId);

      if (!role) {
        throw new AppError(`Role ${roleId} not found`, 404);
      }
    }
  }

  /**
   * Hashes a password.
   *
   * @param {string} password
   * @returns {string}
   */
  _hashPassword(password) {
    validatePassword(password);

    return bcrypt.hashSync(password, BCRYPT_ROUNDS);
  }

  getUsers(options = {}) {
    const result = userRepository.findAllWithQuery(options);

    return {
      rows: result.rows.map((user) => this._toDTO(user)),
      meta: result.meta,
    };
  }

  getUserById(id) {
    const user = userRepository.findById(id);

    if (!user) {
      return null;
    }

    return this._toDTO(user);
  }

  updateUserRoles(userId, roleIds) {
    this._getUserOrThrow(userId);

    this._validateRoles(roleIds);

    userRoleRepository.setRoles(userId, roleIds);

    return this.getUserById(userId);
  }

  createUser(email, password, role = "user", roleIds = [], actorUserId) {
    const existingUser = userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    this._validateRoles(roleIds);

    const user = userRepository.createUser(
      email,
      this._hashPassword(password),
      role,
    );

    if (roleIds.length) {
      userRoleRepository.setRoles(user.id, roleIds);
    }

    const roleNames = roleIds
      .map((id) => roleRepository.findById(id))
      .filter(Boolean)
      .map((role) => role.name);

    auditService.log(actorUserId, "CREATE_USER", "user", user.id, {
      email: user.email,
      role,
      roleNames,
    });

    return this.getUserById(user.id);
  }

  updateUser(userId, data, actorUserId) {
    this._getUserOrThrow(userId);

    const beforeUser = this.getUserById(userId);

    const updates = {
      role: data.role,
    };

    if (data.password) {
      updates.password = this._hashPassword(data.password);
    }

    userRepository.updateUser(userId, updates);

    if (Array.isArray(data.role_ids)) {
      this._validateRoles(data.role_ids);

      userRoleRepository.setRoles(userId, data.role_ids);
    }

    const afterUser = this.getUserById(userId);

    auditService.log(actorUserId, "UPDATE_USER", "user", userId, {
      before: {
        role: beforeUser.role,
        roleNames: beforeUser.job_roles.map((role) => role.name),
      },

      after: {
        role: afterUser.role,
        roleNames: afterUser.job_roles.map((role) => role.name),
      },

      passwordReset: Boolean(data.password),
    });

    return afterUser;
  }

  disableUser(userId, currentUserId) {
    const user = this._getUserOrThrow(userId);

    if (userId === currentUserId) {
      throw new AppError("You cannot disable your own account", 400);
    }

    const activeAdmins = userRepository
      .findAll()
      .filter((u) => u.role === "admin" && u.active);

    if (user.role === "admin" && user.active && activeAdmins.length === 1) {
      throw new AppError("At least one active administrator must remain", 400);
    }

    userRepository.setActive(userId, false);

    auditService.log(currentUserId, "DISABLE_USER", "user", userId, {
      email: user.email,
    });

    return this.getUserById(userId);
  }

  enableUser(userId, currentUserId) {
    const user = this._getUserOrThrow(userId);

    userRepository.setActive(userId, true);

    auditService.log(currentUserId, "ENABLE_USER", "user", userId, {
      email: user.email,
    });

    return this.getUserById(userId);
  }
}

module.exports = new UserService();
