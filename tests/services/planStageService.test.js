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

  it("rejects a stage deadline that would exceed an existing action window", () => {
    expect(() =>
      planStageService.updateStage(2, { due_from_incident_start: 60 }),
    ).toThrow(AppError);

    expect(planStageRepository.updateById).not.toHaveBeenCalled();
  });
});
