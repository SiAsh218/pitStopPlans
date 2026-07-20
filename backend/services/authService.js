/**
 * ============================================================
 * Auth Service (Authentication + Token Management)
 * ============================================================
 *
 * Purpose:
 * - Handles authentication logic
 * - Manages users (register + login)
 * - Generates and verifies JWT tokens
 *
 * Responsibilities:
 * ✅ Password hashing and verification (bcrypt)
 * ✅ User lookup and validation
 * ✅ JWT token creation and verification
 *
 * IMPORTANT:
 * - This layer contains ALL auth logic
 * - Controllers should NOT handle authentication logic
 *
 * Flow:
 * register → hash password → store user
 * login → verify password → issue JWT
 * verify → validate JWT → return payload
 *
 * ============================================================
 */

const userRepository = require("../data/repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

/**
 * Secret key used to sign JWT tokens
 *
 * ⚠️ In production:
 * - MUST come from environment variables
 * - NEVER hardcode secrets in code
 */
const SECRET = process.env.JWT_SECRET;

class AuthService {
  /**
   * ============================================================
   * Register new user
   * ============================================================
   *
   * @param {string} email
   * @param {string} password
   *
   * Flow:
   * 1. Check if user already exists
   * 2. Hash password using bcrypt
   * 3. Store user in database
   * 4. Return safe user object (no password)
   */
  register(email, password) {
    /**
     * Ensure user does not already exist
     */
    const existing = userRepository.findByEmail(email);

    if (existing) {
      throw new AppError("User already exists", 400);
    }

    /**
     * Hash password
     *
     * - Uses bcrypt with salt rounds = 10
     * - Prevents storing plain text passwords
     */
    const hash = bcrypt.hashSync(password, 10);

    /**
     * Insert user into database
     */
    const result = userRepository.insert({
      email,
      password: hash,
      role: "user", // default role
    });

    /**
     * Return safe user object (no password)
     */
    return {
      id: result.lastInsertRowid,
      email,
      role: "user",
    };
  }

  /**
   * ============================================================
   * Login user
   * ============================================================
   *
   * @param {string} email
   * @param {string} password
   *
   * Flow:
   * 1. Find user by email
   * 2. Verify password using bcrypt
   * 3. Generate JWT token
   * 4. Return token + user info
   */
  login(email, password) {
    /**
     * Find user in database
     */
    const user = userRepository.findByEmail(email);

    if (!user) {
      // Do not reveal whether email exists
      throw new AppError("Invalid credentials", 401);
    }

    /**
     * Compare password with hashed version
     */
    const valid = bcrypt.compareSync(password, user.password);

    if (!valid) {
      throw new AppError("Invalid credentials", 401);
    }

    /**
     * Generate JWT token
     *
     * Payload contains:
     * - user id
     * - user role (used for RBAC)
     */
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      SECRET,
      {
        expiresIn: "1h", // token expiry
      },
    );

    /**
     * Return token + user info (no password)
     */
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * ============================================================
   * Verify JWT token
   * ============================================================
   *
   * @param {string} token
   * @returns {object} decoded payload
   *
   * Used by:
   * - auth middleware
   *
   * Flow:
   * 1. Validate signature using SECRET
   * 2. Check expiry
   * 3. Return decoded payload
   */
  verify(token) {
    return jwt.verify(token, SECRET);
  }
}

/**
 * Export singleton instance
 */
module.exports = new AuthService();
