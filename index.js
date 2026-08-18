/**
 * ============================================================
 * Application Entry Point
 * ============================================================
 *
 * Purpose:
 * - Bootstraps the application
 * - Loads configuration and environment variables
 * - Instantiates and starts the main App server
 * - Handles global process-level errors
 *
 * Flow:
 * 1. Load config + environment
 * 2. Resolve port
 * 3. Attach global error handlers
 * 4. Instantiate App
 * 5. Start server
 * ============================================================
 */

const config = require("./config.json");
const App = require("./backend/app");
const logger = require("./backend/logger");

/**
 * Resolve port in priority order:
 * 1. Environment variable (PORT)
 * 2. Default config port
 */
const port = Number(process.env.PORT ?? config.port);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Invalid port");
}

/**
 * Logs a fatal application error and terminates the process.
 *
 * @param {string} type - Error type.
 * @param {unknown} error - Error object or rejection reason.
 * @returns {void}
 */
function handleFatalError(type, error) {
  logger.fatal({ err: error, type }, "Fatal application error");

  setTimeout(() => {
    process.exit(1);
  }, 5000);
}

/**
 * Handles synchronous errors that are not caught anywhere else.
 */
process.on("uncaughtException", (error) => {
  handleFatalError("Uncaught Exception", error);
});

/**
 * Handles unhandled Promise rejections.
 */
process.on("unhandledRejection", (reason) => {
  handleFatalError("Unhandled Rejection", reason);
});

/**
 * Creates and starts the application server.
 *
 * @async
 * @returns {Promise<void>}
 */
async function run() {
  try {
    // Initialise application instance
    const app = new App({ port });

    // Start the HTTP server
    await app.start();

    logger.info({ port }, "Server started");
  } catch (error) {
    logger.fatal({ err: error }, "Application startup failed");

    // Exit if startup fails
    process.exit(1);
  }
}

/**
 * Execute application.
 */
run();
