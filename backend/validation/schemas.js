const { z } = require("zod");
const { stations } = require("../../shared/stations.json");
const stationNames = new Set(stations);

const nearestStationSchema = z
  .string()
  .trim()
  .max(100)
  .refine((value) => value === "" || stationNames.has(value), {
    message: "Nearest station must be selected from the station list",
  })
  .transform((value) => value || null);

const positiveInt = z.coerce.number().int().positive();

const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());

const password = z.string().min(0).max(128); // set to zero as requests can be sent with a password just to update roles

const role = z.enum(["admin", "editor", "user"]);

const loginSchema = z
  .object({
    email,
    password,
  })
  .strict();

const registerSchema = z
  .object({
    email,
    password,
  })
  .strict();

const createUserSchema = z
  .object({
    email,
    password,
    role: role.default("user"),
    role_ids: z.array(positiveInt).max(50).default([]),
  })
  .strict();

const updateUserSchema = z
  .object({
    password: password.optional(),
    role: role.optional(),
    role_ids: z.array(positiveInt).max(50).optional(),
  })
  .strict();

const updateUserRolesSchema = z
  .object({
    role_ids: z.array(positiveInt).max(50),
  })
  .strict();

const reorderStagesSchema = z
  .object({
    stage_ids: z.array(positiveInt).min(1).max(100),
  })
  .strict();

const reorderActionsSchema = z
  .object({
    action_ids: z.array(positiveInt).min(1).max(500),
  })
  .strict();

const createIncidentSchema = z
  .object({
    incident_type_id: positiveInt,
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).nullable().optional(),
    ccil_number: z.string().trim().max(100).nullable().optional(),
    tin_number: z.string().trim().max(100).nullable().optional(),
    nearest_station: nearestStationSchema.nullable().optional(),
  })
  .strict();

const updateCcilSchema = z
  .object({
    ccil_number: z
      .string()
      .trim()
      .regex(/^(?:\d+|NA)$/i)
      .transform((value) => (value.toUpperCase() === "NA" ? "NA" : value)),
  })
  .strict();

const updateTinSchema = z
  .object({
    tin_number: z
      .string()
      .trim()
      .regex(/^(?:\d+|NA)$/i)
      .transform((value) => (value.toUpperCase() === "NA" ? "NA" : value)),
  })
  .strict();

const updateNearestStationSchema = z
  .object({
    nearest_station: nearestStationSchema.nullable(),
  })
  .strict();

const updateIncidentMetaSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).nullable(),
  })
  .strict();

const assignActionSchema = z
  .object({
    user_id: positiveInt,
  })
  .strict();

const createIncidentActionUpdateSchema = z
  .object({
    note: z.string().trim().min(1).max(5000),
  })
  .strict();

const markActionUpdatesReadSchema = z
  .object({
    update_ids: z.array(positiveInt).min(1).max(200),
  })
  .strict();

const idParamSchema = z
  .object({
    id: positiveInt,
  })
  .strict();

const incidentIdParamSchema = z
  .object({
    incidentId: positiveInt,
  })
  .strict();

const planTemplateIdParamSchema = z
  .object({
    templateId: positiveInt,
  })
  .strict();

const planStageIdParamSchema = z
  .object({
    stageId: positiveInt,
  })
  .strict();

module.exports = {
  loginSchema,
  registerSchema,
  createUserSchema,
  updateUserSchema,
  updateUserRolesSchema,
  reorderStagesSchema,
  reorderActionsSchema,
  createIncidentSchema,
  updateCcilSchema,
  updateTinSchema,
  updateNearestStationSchema,
  updateIncidentMetaSchema,
  assignActionSchema,
  createIncidentActionUpdateSchema,
  markActionUpdatesReadSchema,
  idParamSchema,
  incidentIdParamSchema,
  planTemplateIdParamSchema,
  planStageIdParamSchema,
};
