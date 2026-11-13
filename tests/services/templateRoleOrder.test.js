const {
  orderTemplateRoles,
  persistTemplateRoleOrder,
} = require("../../backend/utils/templateRoleOrder");

describe("template role ordering", () => {
  const roles = [
    { id: 6, name: "Infrastructure Controller" },
    { id: 5, name: "Information Controller" },
    { id: 4, name: "Incident Controller" },
    { id: 3, name: "Train Running Controller" },
    { id: 2, name: "RCM" },
    { id: 1, name: "SNDM" },
  ];

  it("uses the preferred role order after roles are assigned", () => {
    expect(orderTemplateRoles(roles)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("preserves saved order and appends newly assigned roles in preferred order", () => {
    expect(orderTemplateRoles(roles, [4, 2])).toEqual([4, 2, 1, 3, 5, 6]);
  });

  it("persists the same role order as the matrix fallback", () => {
    const allRoles = [
      { id: 10, name: "Infrastructure Controller" },
      { id: 5, name: "Train Running Controller" },
      { id: 8, name: "SNDM" },
      { id: 7, name: "RCM" },
      { id: 6, name: "Incident Controller" },
      { id: 9, name: "Information Controller" },
    ];
    const db = {
      prepare: jest
        .fn()
        .mockReturnValueOnce({
          get: () => ({ role_order: "[]" }),
        })
        .mockReturnValueOnce({
          all: () => allRoles,
        })
        .mockReturnValueOnce({
          run: jest.fn(),
        }),
    };

    persistTemplateRoleOrder(db, 20);

    expect(db.prepare.mock.calls[2][0]).toContain(
      "UPDATE plan_templates SET role_order",
    );
    expect(db.prepare.mock.results[2].value.run).toHaveBeenCalledWith(
      "[8,7,5,6,9,10]",
      20,
    );
  });
});
