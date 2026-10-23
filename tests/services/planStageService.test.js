const AppError = require("../../backend/utils/AppError");

jest.mock("../../backend/data/repositories/planStageRepository");
jest.mock("../../backend/data/repositories/planStageActionRepository");
jest.mock("../../backend/data/repositories/planTemplateRepository");

const planStageRepository = require("../../backend/data/repositories/planStageRepository");
const planStageActionRepository = require("../../backend/data/repositories/planStageActionRepository");
const planTemplateRepository = require("../../backend/data/repositories/planTemplateRepository");
const planStageService = require("../../backend/services/planStageService");

describe("PlanStageService deadline validation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    planStageRepository.findById.mockReturnValue({
      id: 2,
      plan_template_id: 10,
      stage_number: 2,
      name: "Second stage",
      due_from_incident_start: 60,
    });
    planTemplateRepository.findById.mockReturnValue({
      id: 10,
      status: "draft",
    });
    planStageRepository.findByTemplateId.mockReturnValue([
      {
        id: 1,
        plan_template_id: 10,
        stage_number: 1,
        due_from_incident_start: 30,
      },
      {
        id: 2,
        plan_template_id: 10,
        stage_number: 2,
        due_from_incident_start: 60,
      },
    ]);
    planStageActionRepository.findByStageId.mockImplementation((stageId) =>
      stageId === 2 ? [{ due_from_stage_start: 31 }] : [],
    );
    planStageRepository.db = {
      transaction: (callback) => () => callback(),
    };
  });

  it("rejects creating a stage with a negative incident-start due time", () => {
    expect(() =>
      planStageService.createStage({
        plan_template_id: 10,
        stage_number: 3,
        name: "Third stage",
        due_from_incident_start: -1,
      }),
    ).toThrow(AppError);

    expect(planStageRepository.insert).not.toHaveBeenCalled();
  });

  it("rejects editing a stage to a negative incident-start due time", () => {
    expect(() =>
      planStageService.updateStage(2, { due_from_incident_start: -1 }),
    ).toThrow(AppError);

    expect(planStageRepository.updateById).not.toHaveBeenCalled();
  });

  it("saves a stage deadline without changing action times when adjustment is declined", () => {
    planStageActionRepository.findByStageId.mockReturnValue([
      {
        id: 20,
        due_from_stage_start: 30,
        due_from_incident_start: 60,
      },
    ]);

    planStageService.updateStage(2, {
      due_from_incident_start: 55,
      adjust_action_due_times: false,
    });

    expect(planStageRepository.updateById).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ due_from_incident_start: 55 }),
    );
    expect(planStageActionRepository.updateById).not.toHaveBeenCalled();
  });

  it("moves only actions due at the old boundary when explicitly confirmed", () => {
    planStageActionRepository.findByStageId.mockImplementation((stageId) =>
      stageId === 2
        ? [
            {
              id: 20,
              due_from_stage_start: 30,
              due_from_incident_start: 60,
            },
            {
              id: 21,
              due_from_stage_start: 20,
              due_from_incident_start: 50,
            },
          ]
        : [],
    );

    planStageService.updateStage(2, {
      due_from_incident_start: 55,
      adjust_action_due_times: true,
    });

    expect(planStageActionRepository.updateById).toHaveBeenCalledTimes(1);
    expect(planStageActionRepository.updateById).toHaveBeenCalledWith(20, {
      due_from_stage_start: 25,
      due_from_incident_start: 55,
    });
    expect(planStageRepository.updateById).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ due_from_incident_start: 55 }),
    );
  });

  it("moves actions due at an edited stage boundary to the new boundary", () => {
    planStageRepository.findById.mockReturnValue({
      id: 1,
      plan_template_id: 10,
      stage_number: 1,
      due_from_incident_start: 10,
    });
    planStageRepository.findByTemplateId.mockReturnValue([
      {
        id: 1,
        plan_template_id: 10,
        stage_number: 1,
        due_from_incident_start: 10,
      },
      {
        id: 2,
        plan_template_id: 10,
        stage_number: 2,
        due_from_incident_start: 30,
      },
    ]);
    planStageActionRepository.findByStageId.mockImplementation((stageId) =>
      stageId === 2
        ? [
            { id: 30, due_from_stage_start: 0, due_from_incident_start: 10 },
            { id: 31, due_from_stage_start: 19, due_from_incident_start: 30 },
          ]
        : [],
    );

    planStageService.updateStage(1, {
      due_from_incident_start: 11,
      adjust_action_due_times: true,
    });

    expect(planStageActionRepository.updateById).toHaveBeenCalledWith(30, {
      due_from_stage_start: 0,
      due_from_incident_start: 11,
    });
    expect(planStageActionRepository.updateById).toHaveBeenCalledTimes(1);
    expect(planStageRepository.updateById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ due_from_incident_start: 11 }),
    );
  });
});
