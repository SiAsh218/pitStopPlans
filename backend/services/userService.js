const userRepository = require("../data/repositories/userRepository");
const userRoleRepository = require("../data/repositories/userRoleRepository");
const roleRepository = require("../data/repositories/roleRepository");

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

  createUser(email, password, role = "user", roleIds = []) {
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

    return this.getUserById(user.id);
  }

  updateUser(userId, data) {
    const user = userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

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

    return this.getUserById(userId);
  }
}

module.exports = new UserService();
