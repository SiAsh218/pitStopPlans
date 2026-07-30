const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const userController = require("../controllers/userController");

module.exports = [
  {
    method: "GET",
    path: "/api/users",

    handler: [
      auth,
      requireRole("admin"),

      userController.getAll.bind(userController),
    ],
  },

  {
    method: "GET",
    path: "/api/users/:id",

    handler: [
      auth,
      requireRole("admin"),

      userController.getById.bind(userController),
    ],
  },

  {
    method: "PUT",
    path: "/api/users/:id/roles",

    handler: [
      auth,
      requireRole("admin"),
      userController.updateRoles.bind(userController),
    ],
  },
];
