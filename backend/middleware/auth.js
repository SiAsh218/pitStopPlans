const authService = require("../services/authService");
const userRepository = require("../data/repositories/userRepository");
const AppError = require("../utils/AppError");

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || "";

  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf("=");
        if (index === -1) {
          return [cookie, ""];
        }

        return [
          cookie.slice(0, index),
          decodeURIComponent(cookie.slice(index + 1)),
        ];
      }),
  );

  return cookies[name] || null;
}

module.exports = function auth(req, res) {
  const header = req.headers["authorization"];
  let token = null;

  if (header) {
    const parts = header.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AppError("Invalid token format", 401);
    }

    token = parts[1];
  } else {
    token = getCookie(req, "accessToken");
  }

  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  let decoded;

  try {
    decoded = authService.verify(token);
  } catch (err) {
    throw new AppError("Invalid token", 401);
  }

  const userId = Number(decoded.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError("Invalid token", 401);
  }

  const user = userRepository.findById(userId);

  if (!user) {
    throw new AppError("Invalid token", 401);
  }

  if (!user.active) {
    throw new AppError("User account is disabled", 401);
  }

  if (decoded.tokenVersion !== user.token_version) {
    throw new AppError("Token has been revoked", 401);
  }

  if (user.must_change_password) {
    const allowedPath =
      req.url === "/api/auth/change-password" ||
      req.url === "/api/auth/logout" ||
      req.url === "/api/auth/validate";

    if (!allowedPath) {
      throw new AppError("Password change required", 403);
    }
  }

  req.user = {
    ...decoded,
    id: userId,
    role: decoded.role,
    jobRoles: decoded.jobRoles || [],
    must_change_password: Boolean(user.must_change_password),
  };

  return true;
};
