const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../../backend/data/repositories/userRepository");
jest.mock("../../backend/data/repositories/userRoleRepository");
jest.mock("../../backend/data/repositories/sessionRepository");
jest.mock("../../backend/data/repositories/loginAttemptRepository");

const userRepository = require("../../backend/data/repositories/userRepository");
const userRoleRepository = require("../../backend/data/repositories/userRoleRepository");
const sessionRepository = require("../../backend/data/repositories/sessionRepository");
const loginAttemptRepository = require("../../backend/data/repositories/loginAttemptRepository");

const AppError = require("../../backend/utils/AppError");

process.env.JWT_SECRET = "test-secret";
process.env.BCRYPT_ROUNDS = "4";
process.env.MAX_LOGIN_ATTEMPTS = "5";
process.env.LOGIN_LOCKOUT_MINUTES = "15";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.JWT_ISSUER = "pit-stop-plans";
process.env.JWT_AUDIENCE = "pit-stop-plans-api";
process.env.SESSION_EXPIRES_IN_DAYS = "30";

const authService = require("../../backend/services/authService");

describe("AuthService", () => {
  const makeUser = (overrides = {}) => ({
    id: 1,
    email: "user@test.com",
    password: "hashed-password",
    role: "user",
    active: true,
    token_version: 1,
    ...overrides,
  });

  const makeJobRoles = () => [
    {
      id: 10,
      name: "Driver",
    },
    {
      id: 20,
      name: "Manager",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = "test-secret";
    process.env.BCRYPT_ROUNDS = "4";
    process.env.MAX_LOGIN_ATTEMPTS = "5";
    process.env.LOGIN_LOCKOUT_MINUTES = "15";
    process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
    process.env.JWT_ISSUER = "pit-stop-plans";
    process.env.JWT_AUDIENCE = "pit-stop-plans-api";
    process.env.SESSION_EXPIRES_IN_DAYS = "30";

    jwt.sign.mockReturnValue("access-token");

    loginAttemptRepository.getStatus.mockReturnValue({
      locked: false,
      attemptsRemaining: 5,
      lockoutRemainingMinutes: 0,
    });

    userRoleRepository.findByUserId.mockReturnValue([]);

    sessionRepository.findValidByTokenHash.mockReturnValue(null);
    sessionRepository.rotate.mockReturnValue(true);
  });

  // ---------------------------------------------------------------------------
  // Registration
  // ---------------------------------------------------------------------------

  describe("register()", () => {
    it("registers a new user successfully", () => {
      userRepository.findByEmail.mockReturnValue(undefined);

      bcrypt.hashSync.mockReturnValue("hashed-password");

      userRepository.insert.mockReturnValue({
        lastInsertRowid: 123,
      });

      const result = authService.register("newuser@test.com", "Password123!");

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "newuser@test.com",
      );

      expect(bcrypt.hashSync).toHaveBeenCalledWith("Password123!", 4);

      expect(userRepository.insert).toHaveBeenCalledWith({
        email: "newuser@test.com",
        password: "hashed-password",
        role: "user",
      });

      expect(result).toEqual({
        id: 123,
        email: "newuser@test.com",
        role: "user",
      });
    });

    it("does not store or return the plaintext password", () => {
      userRepository.findByEmail.mockReturnValue(undefined);

      bcrypt.hashSync.mockReturnValue("hashed-password");

      userRepository.insert.mockReturnValue({
        lastInsertRowid: 123,
      });

      const result = authService.register("newuser@test.com", "Password123!");

      expect(userRepository.insert).not.toHaveBeenCalledWith(
        expect.objectContaining({
          password: "Password123!",
        }),
      );

      expect(result).not.toHaveProperty("password");
    });

    it("rejects an existing user", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      expect(() =>
        authService.register("user@test.com", "Password123!"),
      ).toThrow(new AppError("User already exists", 400));

      expect(bcrypt.hashSync).not.toHaveBeenCalled();
      expect(userRepository.insert).not.toHaveBeenCalled();
    });

    it.each([
      ["short", "Password must be at least 8 characters long"],
      [
        "12345678",
        "Password must contain a letter, a number and a special character.",
      ],
      [
        "abcdefgh",
        "Password must contain a letter, a number and a special character.",
      ],
      [
        "PasswordOnly",
        "Password must contain a letter, a number and a special character.",
      ],
      [
        "Password123",
        "Password must contain a letter, a number and a special character.",
      ],
    ])("rejects invalid password: %s", (password, expectedMessage) => {
      userRepository.findByEmail.mockReturnValue(undefined);

      expect(() =>
        authService.register(
          `invalid-${password.replace(/[^a-z0-9]/gi, "")}@test.com`,
          password,
        ),
      ).toThrow(expectedMessage);

      expect(bcrypt.hashSync).not.toHaveBeenCalled();
      expect(userRepository.insert).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------

  describe("login()", () => {
    it("logs in an active user successfully", () => {
      const user = makeUser();
      const jobRoles = makeJobRoles();

      userRepository.findByEmail.mockReturnValue(user);

      bcrypt.compareSync.mockReturnValue(true);

      userRoleRepository.findByUserId.mockReturnValue(jobRoles);

      const result = authService.login("user@test.com", "Password123!");

      expect(loginAttemptRepository.getStatus).toHaveBeenCalledWith(
        "user@test.com",
        5,
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith("user@test.com");

      expect(bcrypt.compareSync).toHaveBeenCalledWith(
        "Password123!",
        "hashed-password",
      );

      expect(loginAttemptRepository.reset).toHaveBeenCalledWith(
        "user@test.com",
      );

      expect(userRoleRepository.findByUserId).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: expect.any(String),
        user: {
          id: 1,
          email: "user@test.com",
          role: "user",
          jobRoles,
        },
      });
    });

    it("returns a refresh token with sufficient entropy", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(true);

      const result = authService.login("user@test.com", "Password123!");

      expect(result.refreshToken).toEqual(expect.any(String));

      // crypto.randomBytes(64).toString("hex")
      // produces 128 hexadecimal characters.
      expect(result.refreshToken).toMatch(/^[a-f0-9]{128}$/);
    });

    it("creates a hashed refresh-token session", () => {
      userRepository.findByEmail.mockReturnValue(makeUser({ id: 42 }));

      bcrypt.compareSync.mockReturnValue(true);

      const result = authService.login("user@test.com", "Password123!");

      expect(sessionRepository.create).toHaveBeenCalledTimes(1);

      const session = sessionRepository.create.mock.calls[0][0];

      expect(session).toEqual({
        userId: 42,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        expiresAt: expect.any(String),
      });

      expect(session.tokenHash).not.toBe(result.refreshToken);
    });

    it("creates a session with an expiry approximately 30 days in the future", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(true);

      const before = Date.now();

      authService.login("user@test.com", "Password123!");

      const session = sessionRepository.create.mock.calls[0][0];

      const expiry = new Date(session.expiresAt).getTime();

      const expected = before + 30 * 24 * 60 * 60 * 1000;

      // Allow a small execution-time tolerance.
      expect(expiry).toBeGreaterThanOrEqual(expected - 1000);

      expect(expiry).toBeLessThanOrEqual(expected + 5000);
    });

    it("generates the JWT with the expected security claims", () => {
      const user = makeUser({
        id: 7,
        role: "admin",
        token_version: 4,
      });

      const jobRoles = makeJobRoles();

      userRepository.findByEmail.mockReturnValue(user);

      bcrypt.compareSync.mockReturnValue(true);

      userRoleRepository.findByUserId.mockReturnValue(jobRoles);

      authService.login("user@test.com", "Password123!");

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          sub: "7",
          role: "admin",
          jobRoles: [10, 20],
          tokenVersion: 4,
        },
        "test-secret",
        {
          expiresIn: "15m",
          issuer: "pit-stop-plans",
          audience: "pit-stop-plans-api",
          algorithm: "HS256",
        },
      );
    });

    it("includes job-role IDs in the access token", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(true);

      userRoleRepository.findByUserId.mockReturnValue(makeJobRoles());

      authService.login("user@test.com", "Password123!");

      const claims = jwt.sign.mock.calls[0][0];

      expect(claims.jobRoles).toEqual([10, 20]);
    });

    it("does not expose the password in the returned user DTO", () => {
      userRepository.findByEmail.mockReturnValue(
        makeUser({
          password: "SUPER-SECRET-HASH",
        }),
      );

      bcrypt.compareSync.mockReturnValue(true);

      const result = authService.login("user@test.com", "Password123!");

      expect(result.user).not.toHaveProperty("password");
    });

    it("rejects an unknown email", () => {
      userRepository.findByEmail.mockReturnValue(undefined);

      expect(() =>
        authService.login("missing@test.com", "Password123!"),
      ).toThrow(new AppError("Invalid credentials", 401));

      expect(bcrypt.compareSync).not.toHaveBeenCalled();

      expect(loginAttemptRepository.recordFailure).not.toHaveBeenCalled();
    });

    it("rejects a disabled user", () => {
      userRepository.findByEmail.mockReturnValue(
        makeUser({
          active: false,
        }),
      );

      expect(() => authService.login("user@test.com", "Password123!")).toThrow(
        new AppError("Invalid credentials", 401),
      );

      expect(bcrypt.compareSync).not.toHaveBeenCalled();

      expect(loginAttemptRepository.recordFailure).not.toHaveBeenCalled();
    });

    it("checks the lockout status before looking up the user", () => {
      loginAttemptRepository.getStatus.mockReturnValue({
        locked: true,
        attemptsRemaining: 0,
        lockoutRemainingMinutes: 7,
      });

      expect(() =>
        authService.login("locked@test.com", "Password123!"),
      ).toThrow(
        new AppError(
          "Too many failed login attempts. Please try again in 7 minutes.",
          429,
        ),
      );

      expect(userRepository.findByEmail).not.toHaveBeenCalled();

      expect(bcrypt.compareSync).not.toHaveBeenCalled();
    });

    it("records a failed login attempt", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(false);

      loginAttemptRepository.getStatus
        .mockReturnValueOnce({
          locked: false,
          attemptsRemaining: 5,
          lockoutRemainingMinutes: 0,
        })
        .mockReturnValueOnce({
          locked: false,
          attemptsRemaining: 4,
          lockoutRemainingMinutes: 0,
        });

      expect(() =>
        authService.login("user@test.com", "WrongPassword123!"),
      ).toThrow(
        new AppError(
          "Invalid credentials. You have 4 attempts remaining.",
          401,
        ),
      );

      expect(loginAttemptRepository.recordFailure).toHaveBeenCalledWith(
        "user@test.com",
        5,
        15,
      );
    });

    it("uses singular grammar when one login attempt remains", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(false);

      loginAttemptRepository.getStatus
        .mockReturnValueOnce({
          locked: false,
          attemptsRemaining: 2,
          lockoutRemainingMinutes: 0,
        })
        .mockReturnValueOnce({
          locked: false,
          attemptsRemaining: 1,
          lockoutRemainingMinutes: 0,
        });

      expect(() =>
        authService.login("user@test.com", "WrongPassword123!"),
      ).toThrow("Invalid credentials. You have 1 attempt remaining.");
    });

    it("locks the account when the final allowed attempt fails", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(false);

      loginAttemptRepository.getStatus
        .mockReturnValueOnce({
          locked: false,
          attemptsRemaining: 1,
          lockoutRemainingMinutes: 0,
        })
        .mockReturnValueOnce({
          locked: true,
          attemptsRemaining: 0,
          lockoutRemainingMinutes: 15,
        });

      expect(() =>
        authService.login("user@test.com", "WrongPassword123!"),
      ).toThrow(
        new AppError(
          "Too many failed login attempts. Your account has been temporarily locked for 15 minutes.",
          429,
        ),
      );

      expect(loginAttemptRepository.recordFailure).toHaveBeenCalledWith(
        "user@test.com",
        5,
        15,
      );
    });

    it("does not reset login attempts after an unsuccessful login", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(false);

      loginAttemptRepository.getStatus
        .mockReturnValueOnce({
          locked: false,
          attemptsRemaining: 5,
        })
        .mockReturnValueOnce({
          locked: false,
          attemptsRemaining: 4,
        });

      expect(() =>
        authService.login("user@test.com", "WrongPassword123!"),
      ).toThrow();

      expect(loginAttemptRepository.reset).not.toHaveBeenCalled();
    });

    it("resets login attempts after a successful login", () => {
      userRepository.findByEmail.mockReturnValue(makeUser());

      bcrypt.compareSync.mockReturnValue(true);

      authService.login("user@test.com", "Password123!");

      expect(loginAttemptRepository.reset).toHaveBeenCalledWith(
        "user@test.com",
      );
    });
  });

  // ---------------------------------------------------------------------------
  // JWT verification
  // ---------------------------------------------------------------------------

  describe("verify()", () => {
    it("verifies a valid access token", () => {
      const payload = {
        sub: "1",
        role: "user",
        jobRoles: [10],
        tokenVersion: 1,
      };

      jwt.verify.mockReturnValue(payload);

      const result = authService.verify("valid-token");

      expect(result).toEqual(payload);

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-secret", {
        algorithms: ["HS256"],
        issuer: "pit-stop-plans",
        audience: "pit-stop-plans-api",
      });
    });

    it("restricts JWT verification to HS256", () => {
      jwt.verify.mockReturnValue({});

      authService.verify("token");

      const options = jwt.verify.mock.calls[0][2];

      expect(options.algorithms).toEqual(["HS256"]);
    });

    it("requires the configured issuer", () => {
      jwt.verify.mockReturnValue({});

      authService.verify("token");

      expect(jwt.verify.mock.calls[0][2].issuer).toBe("pit-stop-plans");
    });

    it("requires the configured audience", () => {
      jwt.verify.mockReturnValue({});

      authService.verify("token");

      expect(jwt.verify.mock.calls[0][2].audience).toBe("pit-stop-plans-api");
    });

    it("propagates JWT verification errors", () => {
      const error = new Error("invalid signature");

      jwt.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => authService.verify("bad-token")).toThrow(error);
    });
  });

  // ---------------------------------------------------------------------------
  // Refresh tokens
  // ---------------------------------------------------------------------------

  describe("refresh()", () => {
    it("rejects a missing refresh token", async () => {
      await expect(authService.refresh()).rejects.toEqual(
        expect.objectContaining({
          message: "Refresh token required",
          statusCode: 401,
        }),
      );

      expect(sessionRepository.findValidByTokenHash).not.toHaveBeenCalled();
    });

    it("rejects an empty refresh token", async () => {
      await expect(authService.refresh("")).rejects.toEqual(
        expect.objectContaining({
          message: "Refresh token required",
          statusCode: 401,
        }),
      );
    });

    it("rejects an invalid refresh token", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue(undefined);

      await expect(
        authService.refresh("invalid-refresh-token"),
      ).rejects.toEqual(
        expect.objectContaining({
          message: "Invalid session",
          statusCode: 401,
        }),
      );

      expect(userRepository.findById).not.toHaveBeenCalled();

      expect(sessionRepository.rotate).not.toHaveBeenCalled();
    });

    it("looks up sessions using a SHA-256 token hash", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue(undefined);

      await expect(
        authService.refresh("my-refresh-token"),
      ).rejects.toBeDefined();

      expect(sessionRepository.findValidByTokenHash).toHaveBeenCalledWith(
        expect.stringMatching(/^[a-f0-9]{64}$/),
      );

      expect(sessionRepository.findValidByTokenHash.mock.calls[0][0]).not.toBe(
        "my-refresh-token",
      );
    });

    it("rejects a session whose user no longer exists", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 50,
        user_id: 999,
        active: true,
      });

      userRepository.findById.mockReturnValue(undefined);

      await expect(authService.refresh("valid-refresh-token")).rejects.toEqual(
        expect.objectContaining({
          message: "Invalid session",
          statusCode: 401,
        }),
      );

      expect(sessionRepository.rotate).not.toHaveBeenCalled();
    });

    it("rejects a disabled user and revokes the session", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 50,
        user_id: 1,
        active: true,
      });

      userRepository.findById.mockReturnValue(
        makeUser({
          active: false,
        }),
      );

      await expect(authService.refresh("valid-refresh-token")).rejects.toEqual(
        expect.objectContaining({
          message: "User account is disabled",
          statusCode: 401,
        }),
      );

      expect(sessionRepository.revoke).toHaveBeenCalledWith(50);

      expect(sessionRepository.rotate).not.toHaveBeenCalled();
    });

    it("revokes a session marked inactive by the repository", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 51,
        user_id: 1,
        active: false,
      });

      await expect(authService.refresh("valid-refresh-token")).rejects.toEqual(
        expect.objectContaining({
          message: "User account is disabled",
          statusCode: 401,
        }),
      );

      expect(sessionRepository.revoke).toHaveBeenCalledWith(51);

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it("rotates a valid refresh token", async () => {
      const user = makeUser({
        id: 25,
        token_version: 3,
      });

      const jobRoles = makeJobRoles();

      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 99,
        user_id: 25,
        active: true,
      });

      userRepository.findById.mockReturnValue(user);

      userRoleRepository.findByUserId.mockReturnValue(jobRoles);

      sessionRepository.rotate.mockReturnValue(true);

      const result = await authService.refresh("old-refresh-token");

      expect(sessionRepository.rotate).toHaveBeenCalledTimes(1);

      const [sessionId, newTokenHash, newExpiry] =
        sessionRepository.rotate.mock.calls[0];

      expect(sessionId).toBe(99);

      expect(newTokenHash).toMatch(/^[a-f0-9]{64}$/);

      expect(newExpiry).toEqual(expect.any(String));

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: expect.stringMatching(/^[a-f0-9]{128}$/),
        user: {
          id: 25,
          email: "user@test.com",
          role: "user",
          jobRoles,
        },
      });
    });

    it("never reuses the old refresh token during rotation", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 99,
        user_id: 1,
        active: true,
      });

      userRepository.findById.mockReturnValue(makeUser());

      sessionRepository.rotate.mockReturnValue(true);

      const oldToken = "old-refresh-token";

      const result = await authService.refresh(oldToken);

      expect(result.refreshToken).not.toBe(oldToken);
    });

    it("rejects the refresh when session rotation fails", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 99,
        user_id: 1,
        active: true,
      });

      userRepository.findById.mockReturnValue(makeUser());

      sessionRepository.rotate.mockReturnValue(false);

      await expect(authService.refresh("valid-refresh-token")).rejects.toEqual(
        expect.objectContaining({
          message: "Invalid session",
          statusCode: 401,
        }),
      );

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("loads the user's current job roles during refresh", async () => {
      const jobRoles = makeJobRoles();

      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 99,
        user_id: 1,
        active: true,
      });

      userRepository.findById.mockReturnValue(makeUser());

      userRoleRepository.findByUserId.mockReturnValue(jobRoles);

      sessionRepository.rotate.mockReturnValue(true);

      const result = await authService.refresh("valid-refresh-token");

      expect(userRoleRepository.findByUserId).toHaveBeenCalledWith(1);

      expect(result.user.jobRoles).toEqual(jobRoles);
    });
  });

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  describe("logout()", () => {
    it("does nothing when no refresh token is supplied", async () => {
      await authService.logout();

      expect(sessionRepository.findValidByTokenHash).not.toHaveBeenCalled();

      expect(sessionRepository.revoke).not.toHaveBeenCalled();
    });

    it("does nothing when an empty refresh token is supplied", async () => {
      await authService.logout("");

      expect(sessionRepository.findValidByTokenHash).not.toHaveBeenCalled();

      expect(sessionRepository.revoke).not.toHaveBeenCalled();
    });

    it("finds the session using a hashed refresh token", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue(undefined);

      await authService.logout("refresh-token");

      expect(sessionRepository.findValidByTokenHash).toHaveBeenCalledWith(
        expect.stringMatching(/^[a-f0-9]{64}$/),
      );
    });

    it("revokes the matching session", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue({
        id: 123,
      });

      await authService.logout("refresh-token");

      expect(sessionRepository.revoke).toHaveBeenCalledWith(123);
    });

    it("does not revoke anything when no matching session exists", async () => {
      sessionRepository.findValidByTokenHash.mockReturnValue(undefined);

      await authService.logout("unknown-refresh-token");

      expect(sessionRepository.revoke).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Internal security helpers
  // ---------------------------------------------------------------------------

  describe("internal token/session helpers", () => {
    it("creates a cryptographically random refresh token", () => {
      const token = authService._createRefreshToken();

      expect(token).toMatch(/^[a-f0-9]{128}$/);
    });

    it("creates different refresh tokens on successive calls", () => {
      const first = authService._createRefreshToken();

      const second = authService._createRefreshToken();

      expect(first).not.toBe(second);
    });

    it("hashes refresh tokens with SHA-256", () => {
      const hash = authService._hashRefreshToken("refresh-token");

      expect(hash).toMatch(/^[a-f0-9]{64}$/);

      expect(hash).not.toBe("refresh-token");
    });

    it("creates a session expiry in the future", () => {
      const before = Date.now();

      const expiry = authService._createSessionExpiry(30);

      const expiryTime = new Date(expiry).getTime();

      expect(expiryTime).toBeGreaterThan(before);
    });

    it("creates the correct user DTO", () => {
      const user = makeUser({
        id: 10,
        email: "dto@test.com",
        role: "admin",
        password: "must-not-appear",
      });

      const dto = authService._toUserDTO(user, makeJobRoles());

      expect(dto).toEqual({
        id: 10,
        email: "dto@test.com",
        role: "admin",
        jobRoles: makeJobRoles(),
      });

      expect(dto).not.toHaveProperty("password");
    });
  });
});
