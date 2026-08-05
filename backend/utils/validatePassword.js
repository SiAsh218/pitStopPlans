const AppError = require("./AppError");

/**
 * Validates password complexity.
 *
 * @param {string} password
 * @returns {void}
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 400);
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

  if (!hasLetter || !hasNumber || !hasSpecialCharacter) {
    throw new AppError(
      "Password must contain a letter, a number and a special character.",
      400,
    );
  }
}

module.exports = {
  validatePassword,
};
