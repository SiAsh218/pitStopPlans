jest.mock("../../backend/data/seeds/seedPlanTemplate", () => jest.fn());

const seedPlanTemplate = require("../../backend/data/seeds/seedPlanTemplate");
const seedTrainFailureTemplate = require("../../backend/data/seeds/seedTrainFailureTemp");
const seedAddActivationTemplate = require("../../backend/data/seeds/seedAddActivationTemp");

describe("shared template seed data", () => {
  beforeEach(() => {
    seedPlanTemplate.mockClear();
  });

  it.each([
    ["Train Failure", seedTrainFailureTemplate, [13, 13, 6, 5]],
    ["ADD Activation", seedAddActivationTemplate, [13, 13, 7, 4]],
  ])("passes %s through the shared seeder", (name, seed, actionCounts) => {
    const adminUser = { id: 1 };

    seed(adminUser);

    expect(seedPlanTemplate).toHaveBeenCalledTimes(1);
    expect(seedPlanTemplate).toHaveBeenCalledWith(
      adminUser,
      expect.objectContaining({
        name,
        stages: expect.any(Array),
      }),
    );

    const [, plan] = seedPlanTemplate.mock.calls[0];
    expect(plan.stages.map((stage) => stage.actions.length)).toEqual(
      actionCounts,
    );
    expect(
      plan.stages.flatMap((stage) => stage.actions).every((action) =>
        action.roles.length > 0,
      ),
    ).toBe(true);
  });
});
