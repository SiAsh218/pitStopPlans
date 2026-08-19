const AppError = require("../../backend/utils/AppError");

jest.mock("../../backend/data/repositories/incidentRepository");
jest.mock("../../backend/data/repositories/incidentTypeRepository");
jest.mock("../../backend/data/repositories/planTemplateRepository");
jest.mock("../../backend/data/repositories/planStageRepository");
jest.mock("../../backend/data/repositories/planStageActionRepository");
jest.mock("../../backend/data/repositories/incidentActionRepository");

// Mock external services used by IncidentService.
// These tests are for IncidentService itself, so we don't want
// audit/event database operations affecting the tests.
jest.mock("../../backend/services/auditLogService");
jest.mock("../../backend/services/eventService");

const incidentRepository = require("../../backend/data/repositories/incidentRepository");
const incidentTypeRepository = require("../../backend/data/repositories/incidentTypeRepository");
const planTemplateRepository = require("../../backend/data/repositories/planTemplateRepository");
const planStageRepository = require("../../backend/data/repositories/planStageRepository");
const planStageActionRepository = require("../../backend/data/repositories/planStageActionRepository");
const incidentActionRepository = require("../../backend/data/repositories/incidentActionRepository");

const auditService = require("../../backend/services/auditLogService");
const eventService = require("../../backend/services/eventService");

const incidentService = require("../../backend/services/incidentService");

describe("IncidentService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("createIncident", () => {
    it("creates an incident", () => {
      incidentTypeRepository.findById.mockReturnValue({
        id: 1,
        name: "Train Failure",
      });

      planTemplateRepository.findLatestApprovedVersionByIncidentType.mockReturnValue(
        {
          id: 10,
          version: 2,
        },
      );

      incidentRepository.insertIncident.mockReturnValue({
        lastInsertRowid: 100,
      });

      incidentRepository.db = {
        transaction: (callback) => () => callback(),
      };

      planStageRepository.findByTemplateId.mockReturnValue([]);

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 100,
        title: "Broken Train",
        description: null,
        ccil_number: null,
        tin_number: null,
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 2,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.createIncident(
        {
          incident_type_id: 1,
          title: "Broken Train",
        },
        99,
      );

      expect(incidentRepository.insertIncident).toHaveBeenCalled();

      expect(result.id).toBe(100);
      expect(result.status).toBe("active");

      expect(auditService.log).toHaveBeenCalled();
      expect(eventService.broadcast).toHaveBeenCalled();
    });

    it("creates incident actions from template", () => {
      incidentTypeRepository.findById.mockReturnValue({
        id: 1,
      });

      planTemplateRepository.findLatestApprovedVersionByIncidentType.mockReturnValue(
        {
          id: 10,
          version: 1,
        },
      );

      incidentRepository.insertIncident.mockReturnValue({
        lastInsertRowid: 100,
      });

      incidentRepository.db = {
        transaction: (callback) => () => callback(),
      };

      planStageRepository.findByTemplateId.mockReturnValue([
        {
          id: 5,
          stage_number: 1,
          name: "Stage 1",
          due_from_incident_start: 0,
        },
      ]);

      planStageActionRepository.findByStageId.mockReturnValue([
        {
          id: 50,
          action_number: 1,
          title: "Action A",
          description: "Test",
          due_from_stage_start: 10,
          due_from_incident_start: 10,
        },
        {
          id: 51,
          action_number: 2,
          title: "Action B",
          description: "Test",
          due_from_stage_start: 20,
          due_from_incident_start: 20,
        },
      ]);

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 100,
        title: "Broken Train",
        description: null,
        ccil_number: null,
        tin_number: null,
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      incidentService.createIncident(
        {
          incident_type_id: 1,
          title: "Broken Train",
        },
        99,
      );

      expect(incidentActionRepository.insert).toHaveBeenCalledTimes(2);

      expect(auditService.log).toHaveBeenCalled();
      expect(eventService.broadcast).toHaveBeenCalled();
    });

    it("throws when incident type does not exist", () => {
      incidentTypeRepository.findById.mockReturnValue(null);

      expect(() =>
        incidentService.createIncident(
          {
            incident_type_id: 999,
            title: "Broken Train",
          },
          99,
        ),
      ).toThrow(AppError);

      expect(incidentRepository.insertIncident).not.toHaveBeenCalled();
    });

    it("throws when no approved template exists", () => {
      incidentTypeRepository.findById.mockReturnValue({
        id: 1,
      });

      planTemplateRepository.findLatestApprovedVersionByIncidentType.mockReturnValue(
        null,
      );

      expect(() =>
        incidentService.createIncident(
          {
            incident_type_id: 1,
            title: "Broken Train",
          },
          99,
        ),
      ).toThrow("No approved template exists for this incident type");

      expect(incidentRepository.insertIncident).not.toHaveBeenCalled();
    });

    it("throws when incident action creation fails", () => {
      incidentTypeRepository.findById.mockReturnValue({
        id: 1,
      });

      planTemplateRepository.findLatestApprovedVersionByIncidentType.mockReturnValue(
        {
          id: 10,
          version: 1,
        },
      );

      incidentRepository.insertIncident.mockReturnValue({
        lastInsertRowid: 100,
      });

      incidentRepository.db = {
        transaction: (callback) => () => callback(),
      };

      planStageRepository.findByTemplateId.mockReturnValue([
        {
          id: 5,
          stage_number: 1,
          name: "Stage 1",
          due_from_incident_start: 0,
        },
      ]);

      planStageActionRepository.findByStageId.mockReturnValue([
        {
          id: 50,
          action_number: 1,
          title: "Action A",
        },
      ]);

      incidentActionRepository.insert.mockImplementation(() => {
        throw new Error("Boom");
      });

      expect(() =>
        incidentService.createIncident(
          {
            incident_type_id: 1,
            title: "Broken Train",
          },
          99,
        ),
      ).toThrow("Boom");

      expect(auditService.log).not.toHaveBeenCalled();
    });
  });

  describe("closeIncident", () => {
    it("closes an active incident", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "active",
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
      });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        status: "closed",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
      });

      incidentActionRepository.findByIncidentIdWithRoles.mockReturnValue([]);

      incidentRepository.findAllWithDetails.mockReturnValue([]);

      const result = incidentService.closeIncident(1, 99);

      expect(incidentRepository.updateById).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: "closed",
        }),
      );

      expect(result.status).toBe("closed");
    });

    it("returns incident when already closed", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "closed",
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
      });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
        status: "closed",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.closeIncident(1, 99);

      expect(result.status).toBe("closed");

      expect(incidentRepository.updateById).not.toHaveBeenCalled();

      expect(auditService.log).not.toHaveBeenCalled();
      expect(eventService.broadcast).not.toHaveBeenCalled();
    });

    it("throws when incident does not exist", () => {
      incidentRepository.findById.mockReturnValue(null);

      expect(() => incidentService.closeIncident(999, 99)).toThrow(AppError);

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });
  });
});
