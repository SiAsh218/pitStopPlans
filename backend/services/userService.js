const userRepository = require("../data/repositories/userRepository");
const userRoleRepository = require("../data/repositories/userRoleRepository");
const roleRepository = require("../data/repositories/roleRepository");

const AppError = require("../utils/AppError");

class UserService {
  getUsers() {
    const users = userRepository.findAll();

    return users.map((user) => ({
      ...user,
      job_roles: userRoleRepository.findByUserId(user.id),
    }));
  }

  getUserById(id) {
    const user = userRepository.findById(id);

    if (!user) {
      return null;
    }

    return {
      ...user,
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
}

module.exports = new UserService();
