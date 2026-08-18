const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const validate = require("../middleware/validate");

const incidentController = require("../controllers/incidentController");

const {
  idParamSchema,
  createIncidentSchema,
  updateCcilSchema,
  updateTinSchema,
  updateIncidentMetaSchema,
} = require("../validation/schemas");

const authenticatedUser = [auth, requireRole("admin", "editor", "user")];

const editorAccess = [auth, requireRole("admin", "editor")];

module.exports = [
  {
    method: "GET",
    path: "/api/incidents",
    handler: [...authenticatedUser, incidentController.getAll],
  },

  {
    method: "GET",
    path: "/api/incidents/:id",
    handler: [
      ...authenticatedUser,
      validate("params", idParamSchema),
      incidentController.getById,
    ],
  },

  {
    method: "POST",
    path: "/api/incidents",
    handler: [
      ...authenticatedUser,
      validate("body", createIncidentSchema),
      incidentController.create,
    ],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/close",
    handler: [
      ...editorAccess,
      validate("params", idParamSchema),
      incidentController.close,
    ],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/reopen",
    handler: [
      ...editorAccess,
      validate("params", idParamSchema),
      incidentController.reopen,
    ],
  },

  {
    method: "GET",
    path: "/api/incidents/:id/dashboard",
    handler: [
      ...authenticatedUser,
      validate("params", idParamSchema),
      incidentController.dashboard,
    ],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/ccil",
    handler: [
      ...editorAccess,
      validate("params", idParamSchema),
      validate("body", updateCcilSchema),
      incidentController.updateCcil,
    ],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/tin",
    handler: [
      ...editorAccess,
      validate("params", idParamSchema),
      validate("body", updateTinSchema),
      incidentController.updateTin,
    ],
  },

  {
    method: "POST",
    path: "/api/incidents/:id/meta",
    handler: [
      ...editorAccess,
      validate("params", idParamSchema),
      validate("body", updateIncidentMetaSchema),
      incidentController.updateMeta,
    ],
  },
];
