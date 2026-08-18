const AppError = require("../utils/AppError");

function validate(source, schema) {
  return function validateRequest(req, res) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      console.error(
        `[VALIDATION] ${source} validation failed:`,
        result.error.issues,
      );

      throw new AppError("Invalid request", 400);
    }

    req[source] = result.data;

    return true;
  };
}

module.exports = validate;
