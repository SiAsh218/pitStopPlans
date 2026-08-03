const bcrypt = require("bcrypt");
const AppError = require("../../backend/utils/AppError");

jest.mock("bcrypt");

jest.mock("../../backend/data/repositories/userRepository");
jest.mock("../../backend/data/repositories/userRoleRepository");
jest.mock("../../backend/data/repositories/roleRepository");
jest.mock("../../backend/services/auditLogService");

const userRepository = require("../../backend/data/repositories/userRepository");
const userRoleRepository = require("../../backend/data/repositories/userRoleRepository");
const roleRepository = require("../../backend/data/repositories/roleRepository");
const auditService = require("../../backend/services/auditLogService");

const userService = require("../../backend/services/userService");

describe("UserService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getUserById", () => {
    it("returns null when user does not exist", () => {
      userRepository.findById.mockReturnValue(null);

      expect(userService.getUserById(1)).toBeNull();
    });

    it("returns a safe DTO", () => {
      userRepository.findById.mockReturnValue({
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        active: true,
      });

      userRoleRepository.findByUserId.mockReturnValue([]);

      const result = userService.getUserById(1);

      expect(result.password).toBeUndefined();
      expect(result.email).toBe("user@test.com");
    });
  });

  describe("createUser", () => {
    it("creates a user", () => {
      userRepository.findByEmail.mockReturnValue(null);

      bcrypt.hashSync.mockReturnValue("hashed-password");

      userRepository.createUser.mockReturnValue({
        id: 1,
        email: "user@test.com",
        role: "user",
        active: true,
      });

      userRepository.findById.mockReturnValue({
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        role: "user",
        active: true,
      });

      userRoleRepository.findByUserId.mockReturnValue([]);

      const result = userService.createUser(
        "user@test.com",
        "Password123",
        "user",
        [],
        99,
      );

      expect(userRepository.createUser).toHaveBeenCalledWith(
        "user@test.com",
        "hashed-password",
        "user",
      );

      expect(result.email).toBe("user@test.com");
      expect(auditService.log).toHaveBeenCalled();
    });

    it("throws when user already exists", () => {
      userRepository.findByEmail.mockReturnValue({
        id: 1,
      });

      expect(() =>
        userService.createUser("user@test.com", "Password123", "user", [], 99),
      ).toThrow("User already exists");
    });

    it("assigns roles during creation", () => {
      userRepository.findByEmail.mockReturnValue(null);

      bcrypt.hashSync.mockReturnValue("hashed-password");

      roleRepository.findById.mockReturnValue({
        id: 10,
        name: "Driver",
      });

      userRepository.createUser.mockReturnValue({
        id: 1,
        email: "user@test.com",
      });

      userRepository.findById.mockReturnValue({
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        role: "user",
      });

      userRoleRepository.findByUserId.mockReturnValue([
        {
          id: 10,
          name: "Driver",
        },
      ]);

      userService.createUser("user@test.com", "Password123", "user", [10], 99);

      expect(userRoleRepository.setRoles).toHaveBeenCalledWith(1, [10]);
    });

    it("throws when role does not exist", () => {
      userRepository.findByEmail.mockReturnValue(null);

      roleRepository.findById.mockReturnValue(null);

      expect(() =>
        userService.createUser(
          "user@test.com",
          "Password123",
          "user",
          [999],
          99,
        ),
      ).toThrow("Role 999 not found");
    });
  });

  describe("updateUserRoles", () => {
    it("updates user roles", () => {
      userRepository.findById.mockReturnValue({
        id: 1,
        email: "user@test.com",
      });

      roleRepository.findById.mockReturnValue({
        id: 10,
      });

      userRoleRepository.findByUserId.mockReturnValue([
        {
          id: 10,
          name: "Driver",
        },
      ]);

      userService.updateUserRoles(1, [10]);

      expect(userRoleRepository.setRoles).toHaveBeenCalledWith(1, [10]);
    });

    it("throws when user does not exist", () => {
      userRepository.findById.mockReturnValue(null);

      expect(() => userService.updateUserRoles(1, [10])).toThrow(AppError);
    });
  });

  describe("updateUser", () => {
    it("updates role and password", () => {
      userRepository.findById
        .mockReturnValueOnce({
          id: 1,
          email: "user@test.com",
          role: "user",
        })
        .mockReturnValueOnce({
          id: 1,
          email: "user@test.com",
          role: "user",
        })
        .mockReturnValueOnce({
          id: 1,
          email: "user@test.com",
          role: "admin",
        });

      userRoleRepository.findByUserId
        .mockReturnValueOnce([
          {
            id: 10,
            name: "Driver",
          },
        ])
        .mockReturnValueOnce([
          {
            id: 20,
            name: "Manager",
          },
        ]);

      bcrypt.hashSync.mockReturnValue("new-hash");

      roleRepository.findById.mockReturnValue({
        id: 20,
        name: "Manager",
      });

      userService.updateUser(
        1,
        {
          role: "admin",
          password: "NewPassword",
          role_ids: [20],
        },
        99,
      );

      expect(userRepository.updateUser).toHaveBeenCalledWith(1, {
        role: "admin",
        password: "new-hash",
      });

      expect(userRoleRepository.setRoles).toHaveBeenCalledWith(1, [20]);

      expect(auditService.log).toHaveBeenCalled();
    });

    it("throws when user does not exist", () => {
      userRepository.findById.mockReturnValue(null);

      expect(() => userService.updateUser(999, {}, 99)).toThrow(AppError);
    });
  });

  describe("disableUser", () => {
    it("disables a user", () => {
      userRepository.findById
        .mockReturnValueOnce({
          id: 2,
          email: "user@test.com",
          role: "user",
          active: true,
        })
        .mockReturnValueOnce({
          id: 2,
          email: "user@test.com",
          role: "user",
          active: false,
        });

      userRepository.findAll.mockReturnValue([
        {
          id: 1,
          role: "admin",
          active: true,
        },
      ]);

      userRoleRepository.findByUserId.mockReturnValue([]);

      userService.disableUser(2, 99);

      expect(userRepository.setActive).toHaveBeenCalledWith(2, false);

      expect(auditService.log).toHaveBeenCalled();
    });

    it("prevents disabling yourself", () => {
      userRepository.findById.mockReturnValue({
        id: 1,
        role: "admin",
        active: true,
      });

      expect(() => userService.disableUser(1, 1)).toThrow(
        "You cannot disable your own account",
      );
    });

    it("prevents disabling the last admin", () => {
      userRepository.findById.mockReturnValue({
        id: 1,
        role: "admin",
        active: true,
      });

      userRepository.findAll.mockReturnValue([
        {
          id: 1,
          role: "admin",
          active: true,
        },
      ]);

      expect(() => userService.disableUser(1, 99)).toThrow(
        "At least one active administrator must remain",
      );
    });
  });

  describe("enableUser", () => {
    it("enables a user", () => {
      userRepository.findById
        .mockReturnValueOnce({
          id: 1,
          email: "user@test.com",
        })
        .mockReturnValueOnce({
          id: 1,
          email: "user@test.com",
        });

      userRoleRepository.findByUserId.mockReturnValue([]);

      userService.enableUser(1, 99);

      expect(userRepository.setActive).toHaveBeenCalledWith(1, true);

      expect(auditService.log).toHaveBeenCalled();
    });

    it("throws when user does not exist", () => {
      userRepository.findById.mockReturnValue(null);

      expect(() => userService.enableUser(999, 99)).toThrow(AppError);
    });
  });
});
