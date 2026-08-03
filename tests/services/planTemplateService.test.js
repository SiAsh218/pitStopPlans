const AppError = require("../../backend/utils/AppError");

jest.mock("../../backend/data/repositories/planTemplateRepository");
jest.mock("../../backend/data/repositories/incidentTypeRepository");
jest.mock("../../backend/data/repositories/planStageRepository");
jest.mock("../../backend/data/repositories/planStageActionRepository");
jest.mock("../../backend/services/auditLogService");

const planStageRepository = require("../../backend/data/repositories/planStageRepository");
const planStageActionRepository = require("../../backend/data/repositories/planStageActionRepository");
const planTemplateRepository = require("../../backend/data/repositories/planTemplateRepository");
const incidentTypeRepository = require("../../backend/data/repositories/incidentTypeRepository");
const auditService = require("../../backend/services/auditLogService");

const planTemplateService = require("../../backend/services/planTemplateService");

describe("PlanTemplateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("approveTemplate", () => {
    it("approves a draft template", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        status: "draft",
      });

      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 1,
        title: "Test Template",
        version: 1,
        status: "approved",
        incident_type_id: 10,
        incident_type_name: "Test Incident",
      });

      const result = planTemplateService.approveTemplate(1, 99);

      expect(planTemplateRepository.updateById).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: "approved",
          approved_by: 99,
        }),
      );

      expect(auditService.log).toHaveBeenCalled();

      expect(result.status).toBe("approved");
    });

    it("throws when template does not exist", () => {
      planTemplateRepository.findById.mockReturnValue(null);

      expect(() => planTemplateService.approveTemplate(1, 99)).toThrow(
        AppError,
      );
    });

    it("throws when template already approved", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        status: "approved",
      });

      expect(() => planTemplateService.approveTemplate(1, 99)).toThrow(
        "Template already approved",
      );
    });
  });

  describe("createPlanTemplate", () => {
    it("creates version 1 when no template exists", () => {
      incidentTypeRepository.findById.mockReturnValue({
        id: 1,
        name: "Train Failure",
      });

      planTemplateRepository.findLatestVersionByIncidentType.mockReturnValue(
        null,
      );

      planTemplateRepository.insert.mockReturnValue({
        lastInsertRowid: 10,
      });

      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 10,
        version: 1,
        title: "Template",
        status: "draft",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
      });

      const result = planTemplateService.createPlanTemplate(
        {
          incident_type_id: 1,
          title: "Template",
        },
        99,
      );

      expect(planTemplateRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
        }),
      );

      expect(result.version).toBe(1);
    });

    it("increments version number", () => {
      incidentTypeRepository.findById.mockReturnValue({ id: 1 });

      planTemplateRepository.findLatestVersionByIncidentType.mockReturnValue({
        version: 3,
      });

      planTemplateRepository.insert.mockReturnValue({
        lastInsertRowid: 55,
      });

      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 55,
        version: 4,
        title: "Template",
        status: "draft",
        incident_type_id: 1,
        incident_type_name: "Test",
      });

      const result = planTemplateService.createPlanTemplate(
        {
          incident_type_id: 1,
          title: "Template",
        },
        99,
      );

      expect(result.version).toBe(4);
    });

    it("throws when incident type does not exist", () => {
      incidentTypeRepository.findById.mockReturnValue(null);

      expect(() =>
        planTemplateService.createPlanTemplate(
          {
            incident_type_id: 999,
            title: "Template",
          },
          1,
        ),
      ).toThrow(AppError);
    });
  });

  describe("cloneTemplate", () => {
    it("throws when draft already exists", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        incident_type_id: 100,
        title: "Template",
        version: 1,
      });

      planTemplateRepository.findByIncidentTypeAndStatus.mockReturnValue([
        { id: 2 },
      ]);

      expect(() => planTemplateService.cloneTemplate(1, 99)).toThrow(
        "A draft version already exists for this incident type",
      );
    });

    it("creates a new template version", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        incident_type_id: 1,
        title: "Template",
        version: 1,
      });

      planTemplateRepository.findByIncidentTypeAndStatus.mockReturnValue([]);

      planTemplateRepository.findLatestVersionByIncidentType.mockReturnValue({
        version: 1,
      });

      planTemplateRepository.insert.mockReturnValue({
        lastInsertRowid: 2,
      });

      planTemplateRepository.db = {
        transaction: (callback) => () => callback(),
      };

      planStageRepository.findByTemplateId.mockReturnValue([]);

      planStageActionRepository.findByStageId.mockReturnValue([]);

      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 2,
        title: "Template",
        version: 2,
        status: "draft",
        incident_type_id: 1,
        incident_type_name: "Test",
      });

      const result = planTemplateService.cloneTemplate(1, 99);

      expect(planTemplateRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
        }),
      );

      expect(result.version).toBe(2);
    });

    it("clones all stages", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        incident_type_id: 1,
        title: "Template",
        version: 1,
      });

      planTemplateRepository.findByIncidentTypeAndStatus.mockReturnValue([]);

      planTemplateRepository.findLatestVersionByIncidentType.mockReturnValue({
        version: 1,
      });

      planTemplateRepository.insert.mockReturnValue({
        lastInsertRowid: 2,
      });

      planTemplateRepository.db = {
        transaction: (callback) => () => callback(),
      };

      planStageRepository.findByTemplateId.mockReturnValue([
        {
          id: 10,
          stage_number: 1,
          name: "Stage 1",
        },
        {
          id: 11,
          stage_number: 2,
          name: "Stage 2",
        },
      ]);

      planStageRepository.cloneStage.mockReturnValue({
        id: 100,
      });

      planStageActionRepository.findByStageId.mockReturnValue([]);

      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 2,
        title: "Template",
        version: 2,
        status: "draft",
        incident_type_id: 1,
        incident_type_name: "Test",
      });

      planTemplateService.cloneTemplate(1, 99);

      expect(planStageRepository.cloneStage).toHaveBeenCalledTimes(2);
    });

    it("clones all actions", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        incident_type_id: 1,
        title: "Template",
        version: 1,
      });

      planTemplateRepository.findByIncidentTypeAndStatus.mockReturnValue([]);

      planTemplateRepository.findLatestVersionByIncidentType.mockReturnValue({
        version: 1,
      });

      planTemplateRepository.insert.mockReturnValue({
        lastInsertRowid: 2,
      });

      planTemplateRepository.db = {
        transaction: (callback) => () => callback(),
      };

      planStageRepository.findByTemplateId.mockReturnValue([
        {
          id: 10,
          stage_number: 1,
          name: "Stage 1",
        },
      ]);

      planStageRepository.cloneStage.mockReturnValue({
        id: 100,
      });

      planStageActionRepository.findByStageId.mockReturnValue([
        { id: 200 },
        { id: 201 },
      ]);

      planStageActionRepository.cloneAction.mockReturnValue({
        id: 300,
      });

      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 2,
        title: "Template",
        version: 2,
        status: "draft",
        incident_type_id: 1,
        incident_type_name: "Test",
      });

      planTemplateService.cloneTemplate(1, 99);

      expect(planStageActionRepository.cloneAction).toHaveBeenCalledTimes(2);

      expect(planStageActionRepository.cloneAction).toHaveBeenNthCalledWith(
        1,
        200,
        100,
      );

      expect(planStageActionRepository.cloneAction).toHaveBeenNthCalledWith(
        2,
        201,
        100,
      );
    });

    it("throws when action cloning fails", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        incident_type_id: 1,
        title: "Template",
        version: 1,
      });

      planTemplateRepository.findByIncidentTypeAndStatus.mockReturnValue([]);

      planTemplateRepository.findLatestVersionByIncidentType.mockReturnValue({
        version: 1,
      });

      planTemplateRepository.insert.mockReturnValue({
        lastInsertRowid: 2,
      });

      planTemplateRepository.db = {
        transaction: (callback) => () => callback(),
      };

      planStageRepository.findByTemplateId.mockReturnValue([
        {
          id: 10,
          stage_number: 1,
          name: "Stage 1",
        },
      ]);

      planStageRepository.cloneStage.mockReturnValue({
        id: 100,
      });

      planStageActionRepository.findByStageId.mockReturnValue([{ id: 200 }]);

      planStageActionRepository.cloneAction.mockImplementation(() => {
        throw new Error("Boom");
      });

      expect(() => planTemplateService.cloneTemplate(1, 99)).toThrow("Boom");
    });
  });

  describe("getAllPlanTemplates", () => {
    it("returns template list with metadata", () => {
      planTemplateRepository.findAllWithQuery.mockReturnValue({
        rows: [
          {
            id: 1,
            title: "Template",
            version: 1,
            status: "draft",
            incident_type_id: 10,
            incident_type_name: "Train Failure",
          },
        ],
        meta: {
          total: 1,
        },
      });

      const result = planTemplateService.getAllPlanTemplates();

      expect(result.rows).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("getPlanTemplateById", () => {
    it("returns null when template does not exist", () => {
      planTemplateRepository.findByIdWithIncidentType.mockReturnValue(null);

      expect(planTemplateService.getPlanTemplateById(999)).toBeNull();
    });

    it("returns template dto", () => {
      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 1,
        title: "Template",
        version: 1,
        status: "draft",
        incident_type_id: 10,
        incident_type_name: "Train Failure",
      });

      const result = planTemplateService.getPlanTemplateById(1);

      expect(result.id).toBe(1);
      expect(result.incident_type.name).toBe("Train Failure");
    });
  });

  describe("updatePlanTemplate", () => {
    it("returns null when template does not exist", () => {
      planTemplateRepository.findById.mockReturnValue(null);

      expect(
        planTemplateService.updatePlanTemplate(999, { title: "New" }, 99),
      ).toBeNull();
    });

    it("returns existing template when no updates supplied", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        status: "draft",
      });

      planTemplateRepository.findByIdWithIncidentType.mockReturnValue({
        id: 1,
        title: "Template",
        version: 1,
        status: "draft",
        incident_type_id: 1,
        incident_type_name: "Test",
      });

      const result = planTemplateService.updatePlanTemplate(1, {}, 99);

      expect(planTemplateRepository.updateById).not.toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it("updates template title", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        status: "draft",
      });

      planTemplateRepository.findByIdWithIncidentType
        .mockReturnValueOnce({
          id: 1,
          title: "Old Title",
          status: "draft",
          version: 1,
          incident_type_id: 1,
          incident_type_name: "Test",
        })
        .mockReturnValueOnce({
          id: 1,
          title: "New Title",
          status: "draft",
          version: 1,
          incident_type_id: 1,
          incident_type_name: "Test",
        });

      const result = planTemplateService.updatePlanTemplate(
        1,
        {
          title: "New Title",
        },
        99,
      );

      expect(planTemplateRepository.updateById).toHaveBeenCalledWith(1, {
        title: "New Title",
      });

      expect(result.title).toBe("New Title");
    });

    it("rejects updating approved templates", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        status: "approved",
      });

      expect(() =>
        planTemplateService.updatePlanTemplate(1, { title: "New Title" }, 99),
      ).toThrow(
        "Approved templates cannot be edited. Create a new version instead.",
      );
    });
  });

  describe("removeDraftTemplate", () => {
    it("removes a draft template", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        title: "Draft",
        version: 1,
        status: "draft",
        incident_type_id: 10,
      });

      incidentTypeRepository.findById.mockReturnValue({
        id: 10,
        name: "Train Failure",
      });

      planTemplateRepository.findByIncidentTypeAndStatus.mockReturnValue([
        {
          id: 100,
        },
      ]);

      const result = planTemplateService.removeDraftTemplate(1, 99);

      expect(planTemplateRepository.deleteById).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        deletedTemplateId: 1,
        redirectTemplateId: 100,
      });
    });

    it("rejects non-draft templates", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        status: "approved",
      });

      expect(() => planTemplateService.removeDraftTemplate(1, 99)).toThrow(
        "Only draft templates can be removed",
      );
    });
  });

  describe("getTemplateSummary", () => {
    it("returns template summary", () => {
      planTemplateRepository.findAllWithIncidentType.mockReturnValue([
        {
          id: 1,
          title: "Template",
          version: 1,
          status: "draft",
          incident_type_id: 10,
          incident_type_name: "Train Failure",
        },
      ]);

      const result = planTemplateService.getTemplateSummary();

      expect(result).toHaveLength(1);
    });
  });

  describe("getCurrentPlanTemplates", () => {
    it("returns latest templates", () => {
      planTemplateRepository.findLatestWithIncidentType.mockReturnValue([
        {
          id: 1,
          title: "Template",
          version: 2,
          status: "approved",
          incident_type_id: 10,
          incident_type_name: "Train Failure",
        },
      ]);

      const result = planTemplateService.getCurrentPlanTemplates();

      expect(result).toHaveLength(1);
      expect(result[0].version).toBe(2);
    });
  });

  describe("getTemplateHistory", () => {
    it("returns empty array when template does not exist", () => {
      planTemplateRepository.findById.mockReturnValue(null);

      expect(planTemplateService.getTemplateHistory(999)).toEqual([]);
    });

    it("returns template history", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 2,
        incident_type_id: 10,
      });

      planTemplateRepository.findByIncidentTypeId.mockReturnValue([
        { id: 1, version: 1 },
        { id: 2, version: 2 },
      ]);

      const result = planTemplateService.getTemplateHistory(2);

      expect(result).toHaveLength(2);
    });
  });

  describe("retireTemplate", () => {
    it("returns false when template does not exist", () => {
      planTemplateRepository.findById.mockReturnValue(null);

      const result = planTemplateService.retireTemplate(1, 99);

      expect(result).toBe(false);
    });

    it("retires a template", () => {
      planTemplateRepository.findById.mockReturnValue({
        id: 1,
        status: "approved",
      });

      const result = planTemplateService.retireTemplate(1, 99);

      expect(planTemplateRepository.updateById).toHaveBeenCalledWith(1, {
        status: "retired",
      });

      expect(result).toBe(true);
    });
  });
});
