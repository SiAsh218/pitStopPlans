const crypto = require("crypto");
const AppError = require("../utils/AppError");

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";

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

function csrf(req, res) {
  const cookieToken = getCookie(req, CSRF_COOKIE_NAME);
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken) {
    throw new AppError("CSRF validation failed", 403);
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    throw new AppError("CSRF validation failed", 403);
  }

  return true;
}

function setCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString("hex");

  const secure = process.env.NODE_ENV === "production";

  const cookie = [
    `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Strict",
    "Max-Age=2592000",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  const existing = res.getHeader("Set-Cookie");

  res.setHeader("Set-Cookie", existing ? [...existing, cookie] : [cookie]);

  return token;
}

module.exports = {
  csrf,
  setCsrfCookie,
};
