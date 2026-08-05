const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepository = require("../data/repositories/userRepository");
const userRoleRepository = require("../data/repositories/userRoleRepository");
const AppError = require("../utils/AppError");
const { validatePassword } = require("../utils/validatePassword");

const SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_SALT || 10);

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
  _generateToken(user, jobRoles) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        jobRoles: jobRoles.map((role) => role.id),
      },
      SECRET,
      {
        expiresIn: "1h",
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

    const token = this._generateToken(user, jobRoles);

    return {
      token,
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
    return jwt.verify(token, SECRET);
  }
}

module.exports = new AuthService();
