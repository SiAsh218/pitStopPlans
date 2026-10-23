const AppError = require("../../backend/utils/AppError");

jest.mock("../../backend/data/repositories/roleRepository");
jest.mock("../../backend/data/repositories/planTemplateRepository");
jest.mock("../../backend/data/repositories/planStageRepository");
jest.mock("../../backend/data/repositories/planStageActionRepository");

const planTemplateRepository = require("../../backend/data/repositories/planTemplateRepository");
const planStageRepository = require("../../backend/data/repositories/planStageRepository");
const planStageActionRepository = require("../../backend/data/repositories/planStageActionRepository");
const planStageActionService = require("../../backend/services/planStageActionService");

describe("PlanStageActionService due times", () => {
  const stage = {
    id: 2,
    plan_template_id: 10,
    stage_number: 2,
    due_from_incident_start: 60,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    planTemplateRepository.findById.mockReturnValue({
      id: 10,
      status: "draft",
    });
    planStageRepository.findById.mockReturnValue(stage);
    planStageRepository.findByTemplateId.mockReturnValue([
      {
        id: 1,
        stage_number: 1,
        due_from_incident_start: 30,
      },
      stage,
    ]);
    planStageActionRepository.findByStageAndActionNumber.mockReturnValue(null);
    planStageActionRepository.insert.mockReturnValue({ lastInsertRowid: 99 });
    planStageActionRepository.getWithRoles.mockReturnValue({ id: 99 });
  });

  it("derives incident due time from stage start and action offset on create", () => {
    planStageActionService.createAction({
      plan_stage_id: 2,
      action_number: 1,
      title: "Test action",
      description: "Test description",
      due_from_stage_start: 30,
      due_from_incident_start: 999,
      role_ids: [],
    });

    expect(planStageActionRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        due_from_stage_start: 30,
        due_from_incident_start: 60,
      }),
    );
  });

  it("rejects an action deadline beyond the stage end", () => {
    expect(() =>
      planStageActionService.createAction({
        plan_stage_id: 2,
        action_number: 1,
        title: "Test action",
        description: "Test description",
        due_from_stage_start: 31,
        role_ids: [],
      }),
    ).toThrow(AppError);

    expect(planStageActionRepository.insert).not.toHaveBeenCalled();
  });

  it("recalculates incident due time when an action is edited", () => {
    planStageActionRepository.findById.mockReturnValue({
      id: 99,
      plan_stage_id: 2,
      action_number: 1,
      due_from_stage_start: 10,
      due_from_incident_start: 40,
    });

    planStageActionService.updateAction(99, {
      due_from_stage_start: 25,
      due_from_incident_start: 999,
    });

    expect(planStageActionRepository.updateById).toHaveBeenCalledWith(
      99,
      expect.objectContaining({
        due_from_stage_start: 25,
        due_from_incident_start: 55,
      }),
    );
  });
});
