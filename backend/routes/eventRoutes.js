const eventController = require("../controllers/eventController");

module.exports = [
  {
    method: "GET",
    path: "/events",
    handler: eventController.stream,
  },
];
