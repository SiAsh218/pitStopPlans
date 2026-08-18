const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "incident-response-manager",
  },
  redact: [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "headers.authorization",
    "req.headers.authorization",
    "request.headers.authorization",
  ],
});

module.exports = logger;
