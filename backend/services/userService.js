const userRepository = require("../data/repositories/userRepository");
const userRoleRepository = require("../data/repositories/userRoleRepository");
const roleRepository = require("../data/repositories/roleRepository");
const auditService = require("../services/auditLogService.js");

const bcrypt = require("bcrypt");

const AppError = require("../utils/AppError");

class UserService {
  getUsers() {
    const users = userRepository.findAll();

    return users.map((user) => {
      const { password: _password, ...safeUser } = user;

      return {
        ...safeUser,
        job_roles: userRoleRepository.findByUserId(user.id),
      };
    });
  }

  getUserById(id) {
    const user = userRepository.findById(id);

    if (!user) {
      return null;
    }

    const { password: _password, ...safeUser } = user;

    return {
      ...safeUser,
      job_roles: userRoleRepository.findByUserId(user.id),
    };
  }

  updateUserRoles(userId, roleIds) {
    const user = userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    for (const roleId of roleIds) {
      const role = roleRepository.findById(roleId);

      if (!role) {
        throw new AppError(`Role ${roleId} not found`, 404);
      }
    }

    userRoleRepository.setRoles(userId, roleIds);

    return this.getUserById(userId);
  }

  createUser(email, password, role = "user", roleIds = [], actorUserId) {
    const existingUser = userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("User already exists", 400);
    }

    const passwordHash = bcrypt.hashSync(
      password,
      Number(process.env.BCRYPT_SALT || 10),
    );

    const user = userRepository.createUser(email, passwordHash, role);

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
    const user = userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const beforeUser = this.getUserById(userId);

    const updates = {
      role: data.role,
    };

    if (data.password) {
      updates.password = bcrypt.hashSync(
        data.password,
        Number(process.env.BCRYPT_SALT || 10),
      );
    }

    userRepository.updateUser(userId, updates);

    userRoleRepository.setRoles(userId, data.role_ids || []);

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

    return this.getUserById(userId);
  }

  disableUser(userId, currentUserId) {
    const user = userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

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
    const user = userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    userRepository.setActive(userId, true);

    auditService.log(currentUserId, "ENABLE_USER", "user", userId, {
      email: user.email,
    });

    return this.getUserById(userId);
  }
}

module.exports = new UserService();
