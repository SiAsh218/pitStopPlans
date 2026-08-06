const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../../backend/utils/AppError");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../../backend/data/repositories/userRepository");
jest.mock("../../backend/data/repositories/userRoleRepository");

const userRepository = require("../../backend/data/repositories/userRepository");
const userRoleRepository = require("../../backend/data/repositories/userRoleRepository");

process.env.JWT_SECRET = "test-secret"; // Needed for jest to operate

const authService = require("../../backend/services/authService");

describe("AuthService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("register", () => {
    it("registers a new user", () => {
      userRepository.findByEmail.mockReturnValue(null);

      bcrypt.hashSync.mockReturnValue("hashed-password");

      userRepository.insert.mockReturnValue({
        lastInsertRowid: 1,
      });

      const result = authService.register("user@test.com", "Password123!");

      expect(bcrypt.hashSync).toHaveBeenCalled();

      expect(userRepository.insert).toHaveBeenCalledWith({
        email: "user@test.com",
        password: "hashed-password",
        role: "user",
      });

      expect(result).toEqual({
        id: 1,
        email: "user@test.com",
        role: "user",
      });
    });

    it("throws when user already exists", () => {
      userRepository.findByEmail.mockReturnValue({
        id: 1,
      });

      expect(() =>
        authService.register("user@test.com", "Password123!"),
      ).toThrow("User already exists");
    });
  });

  describe("login", () => {
    it("authenticates a valid user", () => {
      const user = {
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        role: "admin",
        active: true,
      };

      const roles = [
        {
          id: 10,
          name: "Driver",
        },
        {
          id: 20,
          name: "Manager",
        },
      ];

      userRepository.findByEmail.mockReturnValue(user);

      bcrypt.compareSync.mockReturnValue(true);

      userRoleRepository.findByUserId.mockReturnValue(roles);

      jwt.sign.mockReturnValue("mock-jwt-token");

      const result = authService.login("user@test.com", "Password123!");

      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        "Password123!",
        "hashed-password",
      );

      expect(jwt.sign).toHaveBeenCalled();

      expect(result.token).toBe("mock-jwt-token");

      expect(result.user).toEqual({
        id: 1,
        email: "user@test.com",
        role: "admin",
        jobRoles: roles,
      });
    });

    it("throws when user does not exist", () => {
      userRepository.findByEmail.mockReturnValue(null);

      expect(() => authService.login("user@test.com", "Password123!")).toThrow(
        AppError,
      );

      expect(() => authService.login("user@test.com", "Password123!")).toThrow(
        "Invalid credentials",
      );
    });

    it("throws when user account is disabled", () => {
      userRepository.findByEmail.mockReturnValue({
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        role: "user",
        active: false,
      });

      expect(() => authService.login("user@test.com", "Password123!")).toThrow(
        "User account is disabled",
      );
    });

    it("throws when password is incorrect", () => {
      userRepository.findByEmail.mockReturnValue({
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        role: "user",
        active: true,
      });

      bcrypt.compareSync.mockReturnValue(false);

      expect(() => authService.login("user@test.com", "WrongPassword")).toThrow(
        "Invalid credentials",
      );
    });

    it("loads user job roles during login", () => {
      userRepository.findByEmail.mockReturnValue({
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        role: "user",
        active: true,
      });

      bcrypt.compareSync.mockReturnValue(true);

      userRoleRepository.findByUserId.mockReturnValue([
        {
          id: 10,
          name: "Driver",
        },
      ]);

      jwt.sign.mockReturnValue("token");

      authService.login("user@test.com", "Password123!");

      expect(userRoleRepository.findByUserId).toHaveBeenCalledWith(1);
    });

    it("generates JWT with job role ids", () => {
      userRepository.findByEmail.mockReturnValue({
        id: 1,
        email: "user@test.com",
        password: "hashed-password",
        role: "admin",
        active: true,
      });

      bcrypt.compareSync.mockReturnValue(true);

      userRoleRepository.findByUserId.mockReturnValue([
        {
          id: 10,
          name: "Driver",
        },
        {
          id: 20,
          name: "Manager",
        },
      ]);

      jwt.sign.mockReturnValue("token");

      authService.login("user@test.com", "Password123!");

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          role: "admin",
          jobRoles: [10, 20],
        },
        expect.any(String),
        {
          expiresIn: "1h",
        },
      );
    });
  });

  describe("verify", () => {
    it("verifies a valid token", () => {
      const payload = {
        id: 1,
        role: "admin",
      };

      jwt.verify.mockReturnValue(payload);

      const result = authService.verify("valid-token");

      expect(jwt.verify).toHaveBeenCalled();

      expect(result).toEqual(payload);
    });

    it("throws when token is invalid", () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => authService.verify("invalid-token")).toThrow(
        "Invalid token",
      );
    });
  });
});
