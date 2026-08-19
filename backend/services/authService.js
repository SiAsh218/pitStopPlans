const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userRepository = require("../data/repositories/userRepository");
const userRoleRepository = require("../data/repositories/userRoleRepository");
const sessionRepository = require("../data/repositories/sessionRepository");
const AppError = require("../utils/AppError");
const { validatePassword } = require("../utils/validatePassword");

const SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

class AuthService {
  /**
   * Converts a user record into a safe DTO.
   *
   * @param {object} user
   * @param {Array<object>} [jobRoles=[]]
   * @returns {object}
   */
  _toUserDTO(user, jobRoles = []) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      jobRoles,
    };
  }

  /**
   * Generates a JWT token.
   *
   * @param {object} user
   * @param {Array<object>} jobRoles
   * @returns {string}
   */
  _generateToken(user, jobRoles = []) {
    return jwt.sign(
      {
        sub: String(user.id),
        role: user.role,
        jobRoles: jobRoles.map((role) => role.id),
        tokenVersion: user.token_version,
      },
      SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
        issuer: process.env.JWT_ISSUER || "pit-stop-plans",
        audience: process.env.JWT_AUDIENCE || "pit-stop-plans-api",
        algorithm: "HS256",
      },
    );
  }

  /**
   * Registers a new user.
   *
   * @param {string} email
   * @param {string} password
   * @returns {object}
   */
  register(email, password) {
    validatePassword(password);

    const existing = userRepository.findByEmail(email);

    if (existing) {
      throw new AppError("User already exists", 400);
    }

    const passwordHash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

    const result = userRepository.insert({
      email,
      password: passwordHash,
      role: "user",
    });

    return {
      id: result.lastInsertRowid,
      email,
      role: "user",
    };
  }

  /**
   * Authenticates a user.
   *
   * @param {string} email
   * @param {string} password
   * @returns {{token: string, user: object}}
   */
  login(email, password) {
    const user = userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.active) {
      throw new AppError("User account is disabled", 403);
    }

    const valid = bcrypt.compareSync(password, user.password);

    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    const jobRoles = userRoleRepository.findByUserId(user.id);

    const accessToken = this._generateToken(user, jobRoles);

    const refreshToken = this._createRefreshToken();

    const refreshTokenHash = this._hashRefreshToken(refreshToken);

    const sessionExpiry = this._createSessionExpiry(
      Number(process.env.SESSION_EXPIRES_IN_DAYS || 30),
    );

    sessionRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: sessionExpiry,
    });

    return {
      accessToken,
      refreshToken,
      user: this._toUserDTO(user, jobRoles),
    };
  }

  /**
   * Verifies a JWT token.
   *
   * @param {string} token
   * @returns {object}
   */
  verify(token) {
    return jwt.verify(token, SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.JWT_ISSUER || "pit-stop-plans",
      audience: process.env.JWT_AUDIENCE || "pit-stop-plans-api",
    });
  }

  _createRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  _hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  _createSessionExpiry(days) {
    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + days);

    return expiresAt.toISOString();
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AppError("Refresh token required", 401);
    }

    const tokenHash = this._hashRefreshToken(refreshToken);

    const session = sessionRepository.findValidByTokenHash(tokenHash);

    if (!session) {
      throw new AppError("Invalid session", 401);
    }

    if (!session.active) {
      sessionRepository.revoke(session.id);

      throw new AppError("User account is disabled", 401);
    }

    const user = userRepository.findById(session.user_id);

    if (!user) {
      throw new AppError("Invalid session", 401);
    }

    if (!user.active) {
      sessionRepository.revoke(session.id);

      throw new AppError("User account is disabled", 401);
    }

    const jobRoles = userRoleRepository.findByUserId(user.id);

    /*
     * Generate a completely new refresh token.
     */
    const newRefreshToken = this._createRefreshToken();

    const newRefreshTokenHash = this._hashRefreshToken(newRefreshToken);

    const sessionExpiry = this._createSessionExpiry(
      Number(process.env.SESSION_EXPIRES_IN_DAYS || 30),
    );

    /*
     * Replace the old refresh-token hash with
     * the new one.
     *
     * The old refresh token is now invalid.
     */
    const rotated = sessionRepository.rotate(
      session.id,
      newRefreshTokenHash,
      sessionExpiry,
    );

    if (!rotated) {
      throw new AppError("Invalid session", 401);
    }

    const accessToken = this._generateToken(user, jobRoles);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: this._toUserDTO(user, jobRoles),
    };
  }

  async logout(refreshToken) {
    if (!refreshToken) {
      return;
    }

    const tokenHash = this._hashRefreshToken(refreshToken);

    const session = sessionRepository.findValidByTokenHash(tokenHash);

    if (session) {
      sessionRepository.revoke(session.id);
    }
  }
}

module.exports = new AuthService();
