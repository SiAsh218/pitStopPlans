const eventController = require("../controllers/eventController");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

module.exports = [
  {
    method: "GET",
    path: "/events",
    handler: [
      auth,
      requireRole("admin", "editor", "user"),
      eventController.stream,
    ],
  },
];
