const db = require("../data/db");
const AppError = require("../utils/AppError");

const CONFLICT_MESSAGE =
  "This template was changed by another user. Reload the page before making more changes.";

function getTemplateId(req) {
  const pathname = (req.url || "").split("?")[0];

  if (pathname.startsWith("/api/plan_templates/")) {
    return Number(req.params.id || req.params.templateId);
  }

  if (pathname.startsWith("/api/plan_stages")) {
    if (req.params.templateId) {
      return Number(req.params.templateId);
    }

    if (req.body?.plan_template_id) {
      return Number(req.body.plan_template_id);
    }

    const stageId = Number(req.params.stageId || req.params.id);
    const stage = db
      .prepare("SELECT plan_template_id FROM plan_stages WHERE id = ?")
      .get(stageId);

    return stage?.plan_template_id;
  }

  if (pathname.startsWith("/api/plan_stage_actions")) {
    const stageId =
      Number(req.body?.plan_stage_id) ||
      Number(req.params.stageId) ||
      db
        .prepare(
          "SELECT plan_stage_id FROM plan_stage_actions WHERE id = ?",
        )
        .get(Number(req.params.id))?.plan_stage_id;

    if (!stageId) {
      return undefined;
    }

    return db
      .prepare("SELECT plan_template_id FROM plan_stages WHERE id = ?")
      .get(stageId)?.plan_template_id;
  }

  return undefined;
}

function requireTemplateRevision(controller) {
  return (req, res) => {
    const templateId = getTemplateId(req);
    const expectedRevision = Number(req.headers["if-match"]);

    if (
      !templateId ||
      !Number.isSafeInteger(expectedRevision) ||
      expectedRevision < 1
    ) {
      throw new AppError("A valid template revision is required", 428);
    }

    const transaction = db.transaction(() => {
      const template = db
        .prepare("SELECT revision FROM plan_templates WHERE id = ?")
        .get(templateId);

      if (!template) {
        throw new AppError("Plan Template not found", 404);
      }

      if (template.revision !== expectedRevision) {
        throw new AppError(CONFLICT_MESSAGE, 409);
      }

      controller(req, res);

      const remainingTemplate = db
        .prepare("SELECT id FROM plan_templates WHERE id = ?")
        .get(templateId);

      if (!remainingTemplate) {
        return;
      }

      const result = db
        .prepare(
          "UPDATE plan_templates SET revision = revision + 1 WHERE id = ? AND revision = ?",
        )
        .run(templateId, expectedRevision);

      if (result.changes !== 1) {
        throw new AppError(CONFLICT_MESSAGE, 409);
      }
    });

    transaction.immediate();
  };
}

module.exports = requireTemplateRevision;
