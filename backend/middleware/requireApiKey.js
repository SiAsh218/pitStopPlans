const AppError = require("../utils/AppError");

module.exports = function requireApiKey(req, res) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    throw new AppError("API key required", 401);
  }

  if (apiKey !== process.env.REPORTING_API_KEY) {
    throw new AppError("Invalid API key", 401);
  }

  return true;
};
