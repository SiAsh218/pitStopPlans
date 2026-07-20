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
 * 2. Resolve port and environment
 * 3. Attach global error handlers
 * 4. Instantiate App
 * 5. Start server
 * ============================================================
 */

const path = require("path");
const config = require("./config.json");

// Import the main application class (backend server)
const App = require(path.join(__dirname, "backend", "app.js"));

/**
 * Determine runtime environment
 * Defaults to "development" if not set
 */
const env = process.env.NODE_ENV || "development";

/**
 * Resolve port in priority order:
 * 1. Environment variable (PORT)
 * 2. Default config port
 */
const port = process.env.PORT || config.port;

/**
 * ============================================================
 * Global Error Handlers (Process Level)
 * ============================================================
 *
 * These catch errors outside normal request flow.
 * Without these, Node can fail silently or behave unpredictably.
 */

/**
 * Handles synchronous errors that are not caught anywhere else
 */
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);

  // Exit process to avoid running in unstable state
  process.exit(1);
});

/**
 * Handles unhandled Promise rejections
 */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);

  // Exit for consistency and safety
  process.exit(1);
});

/**
 * ============================================================
 * Main Application Bootstrap
 * ============================================================
 *
 * Creates and starts the server.
 */
async function run() {
  try {
    // Initialise application instance
    const app = new App({ port });

    // Start the HTTP server
    await app.start();

    console.log(`Server running on port ${port}`);
  } catch (err) {
    console.error("Failed to start app:", err);

    // Exit if startup fails
    process.exit(1);
  }
}

/**
 * Execute application
 */
run();
