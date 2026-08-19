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

  describe("getIncidentById", () => {
    it("returns an incident when it exists", () => {
      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: "Train has failed",
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
        status: "active",
        started_at: "2026-08-19T10:00:00.000Z",
        closed_at: null,
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 2,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.getIncidentById(1);

      expect(incidentRepository.findByIdWithDetails).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        id: 1,
        title: "Broken Train",
        description: "Train has failed",
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
        status: "active",
        started_at: "2026-08-19T10:00:00.000Z",
        closed_at: null,
        incident_type: {
          id: 1,
          name: "Train Failure",
        },
        template: {
          id: 10,
          version: 2,
        },
        created_by: {
          id: 99,
          email: "user@test.com",
        },
      });
    });

    it("returns null when the incident does not exist", () => {
      incidentRepository.findByIdWithDetails.mockReturnValue(null);

      const result = incidentService.getIncidentById(999);

      expect(incidentRepository.findByIdWithDetails).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe("getAllIncidents", () => {
    it("returns incidents with action summaries and metadata", () => {
      incidentRepository.findAllWithDetailsQuery.mockReturnValue({
        rows: [
          {
            id: 1,
            title: "Broken Train",
            description: "Train has failed",
            ccil_number: "CCIL-123",
            tin_number: "TIN-123",
            status: "active",
            started_at: "2026-08-19T10:00:00.000Z",
            closed_at: null,
            incident_type_id: 1,
            incident_type_name: "Train Failure",
            plan_template_id: 10,
            template_version: 2,
            created_by: 99,
            created_by_email: "user@test.com",
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      incidentActionRepository.findByIncidentIdWithRoles.mockReturnValue([
        {
          id: 101,
          status: "completed",
        },
        {
          id: 102,
          status: "in_progress",
        },
        {
          id: 103,
          status: "pending",
        },
      ]);

      const options = {
        page: 1,
        limit: 20,
      };

      const result = incidentService.getAllIncidents(options);

      expect(incidentRepository.findAllWithDetailsQuery).toHaveBeenCalledWith(
        options,
      );

      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });

      expect(result.rows).toHaveLength(1);

      expect(result.rows[0]).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Broken Train",
          status: "active",
          incident_type: {
            id: 1,
            name: "Train Failure",
          },
          template: {
            id: 10,
            version: 2,
          },
          created_by: {
            id: 99,
            email: "user@test.com",
          },
          summary: {
            total_actions: 3,
            completed_actions: 1,
            in_progress_actions: 1,
            pending_actions: 1,
            completion_percentage: 33,
          },
        }),
      );

      expect(
        incidentActionRepository.findByIncidentIdWithRoles,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe("_validateIncidentIsActive", () => {
    it("does not throw when the incident is active", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "active",
      });

      expect(() => {
        incidentService._validateIncidentIsActive(1);
      }).not.toThrow();

      expect(incidentRepository.findById).toHaveBeenCalledWith(1);
    });

    it("throws when the incident does not exist", () => {
      incidentRepository.findById.mockReturnValue(null);

      expect(() => {
        incidentService._validateIncidentIsActive(999);
      }).toThrow("Incident not found");

      expect(incidentRepository.findById).toHaveBeenCalledWith(999);
    });

    it("throws when the incident is closed", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "closed",
      });

      expect(() => {
        incidentService._validateIncidentIsActive(1);
      }).toThrow("Actions cannot be updated on a closed incident");

      expect(incidentRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("closeIncident", () => {
    it("throws when CCIL number is missing", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "active",
        ccil_number: null,
        tin_number: "TIN-123",
      });

      expect(() => {
        incidentService.closeIncident(1, 99);
      }).toThrow(
        "CCIL Number and TIN Number must be completed before an incident can be closed",
      );

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });

    it("throws when TIN number is missing", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "active",
        ccil_number: "CCIL-123",
        tin_number: null,
      });

      expect(() => {
        incidentService.closeIncident(1, 99);
      }).toThrow(
        "CCIL Number and TIN Number must be completed before an incident can be closed",
      );

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });

    it("throws when both CCIL number and TIN number are missing", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "active",
        ccil_number: null,
        tin_number: null,
      });

      expect(() => {
        incidentService.closeIncident(1, 99);
      }).toThrow(
        "CCIL Number and TIN Number must be completed before an incident can be closed",
      );

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });
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
  describe("reopenIncident", () => {
    it("reopens a closed incident", () => {
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
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      incidentRepository.findAllWithDetails.mockReturnValue([
        {
          id: 1,
          status: "active",
          closed_at: null,
        },
      ]);

      incidentActionRepository.findByIncidentIdWithRoles.mockReturnValue([]);

      const result = incidentService.reopenIncident(1, 99);

      expect(incidentRepository.updateById).toHaveBeenCalledWith(1, {
        status: "active",
        closed_at: null,
      });

      expect(result.status).toBe("active");

      expect(auditService.log).toHaveBeenCalledWith(
        99,
        "REOPEN_INCIDENT",
        "incident",
        1,
        expect.objectContaining({
          before: {
            status: "closed",
          },
          after: {
            status: "active",
          },
        }),
      );

      expect(eventService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "incident-reopened",
          incidentId: 1,
          userId: 99,
        }),
      );
    });

    it("returns the incident without updating when already active", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "active",
      });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.reopenIncident(1, 99);

      expect(result.status).toBe("active");

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
      expect(eventService.broadcast).not.toHaveBeenCalled();
    });

    it("throws when the incident does not exist", () => {
      incidentRepository.findById.mockReturnValue(null);

      expect(() => incidentService.reopenIncident(999, 99)).toThrow(AppError);

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });
  });

  describe("getIncidentDashboard", () => {
    it("returns incident dashboard data", () => {
      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      incidentActionRepository.findByIncidentIdWithRoles.mockReturnValue([
        {
          id: 101,
          status: "completed",
        },
        {
          id: 102,
          status: "pending",
        },
      ]);

      const result = incidentService.getIncidentDashboard(1);

      expect(result.incident.id).toBe(1);

      expect(result.summary).toEqual({
        total_actions: 2,
        completed_actions: 1,
        in_progress_actions: 0,
        pending_actions: 1,
        completion_percentage: 50,
      });

      expect(result.actions).toHaveLength(2);

      expect(
        incidentActionRepository.findByIncidentIdWithRoles,
      ).toHaveBeenCalledWith(1);
    });

    it("returns null when the incident does not exist", () => {
      incidentRepository.findByIdWithDetails.mockReturnValue(null);

      const result = incidentService.getIncidentDashboard(999);

      expect(result).toBeNull();

      expect(
        incidentActionRepository.findByIncidentIdWithRoles,
      ).not.toHaveBeenCalled();
    });
  });

  describe("getDashboardStatistics", () => {
    it("calculates active incidents, resolved today and open workload", () => {
      const today = new Date();

      const todayClosed = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        10,
        0,
        0,
      ).toISOString();

      const yesterday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1,
        10,
        0,
        0,
      ).toISOString();

      incidentRepository.findAllWithDetails.mockReturnValue([
        {
          id: 1,
          status: "active",
          closed_at: null,
        },
        {
          id: 2,
          status: "closed",
          closed_at: todayClosed,
        },
        {
          id: 3,
          status: "closed",
          closed_at: yesterday,
        },
      ]);

      incidentActionRepository.findByIncidentIdWithRoles.mockImplementation(
        (incidentId) => {
          if (incidentId === 1) {
            return [
              { status: "completed" },
              { status: "pending" },
              { status: "in_progress" },
            ];
          }

          return [];
        },
      );

      const result = incidentService.getDashboardStatistics();

      expect(result).toEqual({
        active: 1,
        resolvedToday: 1,
        openWorkload: 2,
      });
    });

    it("returns zero statistics when there are no incidents", () => {
      incidentRepository.findAllWithDetails.mockReturnValue([]);

      const result = incidentService.getDashboardStatistics();

      expect(result).toEqual({
        active: 0,
        resolvedToday: 0,
        openWorkload: 0,
      });
    });

    it("ignores closed incidents without a closed date", () => {
      incidentRepository.findAllWithDetails.mockReturnValue([
        {
          id: 1,
          status: "closed",
          closed_at: null,
        },
      ]);

      const result = incidentService.getDashboardStatistics();

      expect(result.resolvedToday).toBe(0);
      expect(result.openWorkload).toBe(0);
    });
  });

  describe("getIncidentForDashboard", () => {
    it("returns incident with action summary", () => {
      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
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

      incidentActionRepository.findByIncidentIdWithRoles.mockReturnValue([
        {
          id: 101,
          status: "completed",
        },
        {
          id: 102,
          status: "in_progress",
        },
      ]);

      const result = incidentService.getIncidentForDashboard(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: "Broken Train",
          summary: {
            total_actions: 2,
            completed_actions: 1,
            in_progress_actions: 1,
            pending_actions: 0,
            completion_percentage: 50,
          },
        }),
      );
    });

    it("returns null when the incident does not exist", () => {
      incidentRepository.findByIdWithDetails.mockReturnValue(null);

      const result = incidentService.getIncidentForDashboard(999);

      expect(result).toBeNull();

      expect(
        incidentActionRepository.findByIncidentIdWithRoles,
      ).not.toHaveBeenCalled();
    });
  });

  describe("updateCcilNumber", () => {
    it("updates the CCIL number", () => {
      incidentRepository.findById
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          ccil_number: null,
        })
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          ccil_number: null,
        });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        ccil_number: "CCIL-999",
        tin_number: "TIN-123",
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.updateCcilNumber(1, "CCIL-999", 99);

      expect(incidentRepository.updateById).toHaveBeenCalledWith(1, {
        ccil_number: "CCIL-999",
      });

      expect(result.ccil_number).toBe("CCIL-999");

      expect(auditService.log).toHaveBeenCalledWith(
        99,
        "UPDATE_INCIDENT_CCIL",
        "incident",
        1,
        expect.objectContaining({
          before: {
            ccilNumber: null,
          },
          after: {
            ccilNumber: "CCIL-999",
          },
        }),
      );

      expect(eventService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "incident-ccil-updated",
          incidentId: 1,
          userId: 99,
        }),
      );
    });

    it("stores null when the CCIL number is empty", () => {
      incidentRepository.findById
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          ccil_number: "CCIL-123",
        })
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          ccil_number: "CCIL-123",
        });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        ccil_number: null,
        tin_number: "TIN-123",
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.updateCcilNumber(1, "", 99);

      expect(incidentRepository.updateById).toHaveBeenCalledWith(1, {
        ccil_number: null,
      });

      expect(result.ccil_number).toBeNull();
    });

    it("rejects updates to a closed incident", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "closed",
        ccil_number: "CCIL-123",
      });

      expect(() => incidentService.updateCcilNumber(1, "CCIL-999", 99)).toThrow(
        "Actions cannot be updated on a closed incident",
      );

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });

    it("throws when the incident does not exist", () => {
      incidentRepository.findById.mockReturnValue(null);

      expect(() =>
        incidentService.updateCcilNumber(999, "CCIL-999", 99),
      ).toThrow("Incident not found");
    });
  });

  describe("updateTinNumber", () => {
    it("updates the TIN number", () => {
      incidentRepository.findById
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          tin_number: null,
        })
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          tin_number: null,
        });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        ccil_number: "CCIL-123",
        tin_number: "TIN-999",
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.updateTinNumber(1, "TIN-999", 99);

      expect(incidentRepository.updateById).toHaveBeenCalledWith(1, {
        tin_number: "TIN-999",
      });

      expect(result.tin_number).toBe("TIN-999");

      expect(auditService.log).toHaveBeenCalledWith(
        99,
        "UPDATE_INCIDENT_TIN",
        "incident",
        1,
        expect.objectContaining({
          before: {
            tinNumber: null,
          },
          after: {
            tinNumber: "TIN-999",
          },
        }),
      );

      expect(eventService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "incident-tin-updated",
          incidentId: 1,
          userId: 99,
        }),
      );
    });

    it("stores null when the TIN number is empty", () => {
      incidentRepository.findById
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          tin_number: "TIN-123",
        })
        .mockReturnValueOnce({
          id: 1,
          status: "active",
          tin_number: "TIN-123",
        });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Broken Train",
        description: null,
        ccil_number: "CCIL-123",
        tin_number: null,
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.updateTinNumber(1, "", 99);

      expect(incidentRepository.updateById).toHaveBeenCalledWith(1, {
        tin_number: null,
      });

      expect(result.tin_number).toBeNull();
    });

    it("rejects updates to a closed incident", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "closed",
        tin_number: "TIN-123",
      });

      expect(() => incidentService.updateTinNumber(1, "TIN-999", 99)).toThrow(
        "Actions cannot be updated on a closed incident",
      );

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });
  });

  describe("updateMeta", () => {
    it("updates the title and description", () => {
      incidentRepository.findById
        .mockReturnValueOnce({
          id: 1,
          status: "active",
        })
        .mockReturnValueOnce({
          id: 1,
          status: "active",
        });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Updated Train",
        description: "Updated description",
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.updateMeta(
        1,
        "Updated Train",
        "Updated description",
        99,
      );

      expect(incidentRepository.updateById).toHaveBeenCalledWith(1, {
        title: "Updated Train",
        description: "Updated description",
      });

      expect(result.title).toBe("Updated Train");
      expect(result.description).toBe("Updated description");

      expect(eventService.broadcast).toHaveBeenCalledWith({
        type: "incident-meta-updated",
        incidentId: 1,
        userId: 99,
      });
    });

    it("stores null when description is empty", () => {
      incidentRepository.findById
        .mockReturnValueOnce({
          id: 1,
          status: "active",
        })
        .mockReturnValueOnce({
          id: 1,
          status: "active",
        });

      incidentRepository.findByIdWithDetails.mockReturnValue({
        id: 1,
        title: "Updated Train",
        description: null,
        ccil_number: "CCIL-123",
        tin_number: "TIN-123",
        status: "active",
        incident_type_id: 1,
        incident_type_name: "Train Failure",
        plan_template_id: 10,
        template_version: 1,
        created_by: 99,
        created_by_email: "user@test.com",
      });

      const result = incidentService.updateMeta(1, "Updated Train", "", 99);

      expect(incidentRepository.updateById).toHaveBeenCalledWith(1, {
        title: "Updated Train",
        description: null,
      });

      expect(result.description).toBeNull();
    });

    it("rejects updates to a closed incident", () => {
      incidentRepository.findById.mockReturnValue({
        id: 1,
        status: "closed",
      });

      expect(() =>
        incidentService.updateMeta(1, "Updated Train", "Description", 99),
      ).toThrow("Actions cannot be updated on a closed incident");

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });

    it("throws when the incident does not exist", () => {
      incidentRepository.findById.mockReturnValue(null);

      expect(() =>
        incidentService.updateMeta(999, "Updated Train", "Description", 99),
      ).toThrow("Incident not found");

      expect(incidentRepository.updateById).not.toHaveBeenCalled();
    });
  });
});
