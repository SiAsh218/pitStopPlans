jest.mock("../../backend/data/db", () => {
  const state = { revision: 3, exists: true };

  const database = {
    prepare: jest.fn((query) => ({
      get: jest.fn(() => {
        if (query.includes("SELECT revision")) {
          return { revision: state.revision };
        }

        if (query.includes("SELECT id FROM plan_templates")) {
          return state.exists ? { id: 12 } : undefined;
        }

        return { id: 12 };
      }),
      run: jest.fn((templateId, expectedRevision) => {
        if (templateId !== 12 || state.revision !== expectedRevision) {
          return { changes: 0 };
        }

        state.revision += 1;
        return { changes: 1 };
      }),
    })),
    transaction: jest.fn((callback) => {
      const transaction = () => callback();
      transaction.immediate = transaction;
      return transaction;
    }),
    state,
  };

  return database;
});

const db = require("../../backend/data/db");
const requireTemplateRevision = require("../../backend/middleware/templateRevision");

describe("template revision middleware", () => {
  beforeEach(() => {
    db.state.revision = 3;
    db.state.exists = true;
    jest.clearAllMocks();
  });

  it("runs the edit and advances the template revision", () => {
    const controller = jest.fn();
    const middleware = requireTemplateRevision(controller);

    middleware(
      {
        url: "/api/plan_templates/12",
        params: { id: "12" },
        headers: { "if-match": "3" },
      },
      {},
    );

    expect(controller).toHaveBeenCalled();
    expect(db.state.revision).toBe(4);
  });

  it("rejects stale revisions without running the edit", () => {
    const controller = jest.fn();
    const middleware = requireTemplateRevision(controller);

    expect(() =>
      middleware(
        {
          url: "/api/plan_templates/12",
          params: { id: "12" },
          headers: { "if-match": "2" },
        },
        {},
      ),
    ).toThrow(
      "This template was changed by another user. Reload the page before making more changes.",
    );

    expect(controller).not.toHaveBeenCalled();
    expect(db.state.revision).toBe(3);
  });

  it("requires a revision before accepting an edit", () => {
    const controller = jest.fn();
    const middleware = requireTemplateRevision(controller);

    expect(() =>
      middleware(
        {
          url: "/api/plan_templates/12",
          params: { id: "12" },
          headers: {},
        },
        {},
      ),
    ).toThrow("A valid template revision is required");

    expect(controller).not.toHaveBeenCalled();
  });

  it("allows a guarded draft deletion without incrementing a deleted row", () => {
    const controller = jest.fn(() => {
      db.state.exists = false;
    });
    const middleware = requireTemplateRevision(controller);

    middleware(
      {
        url: "/api/plan_templates/12",
        params: { id: "12" },
        headers: { "if-match": "3" },
      },
      {},
    );

    expect(controller).toHaveBeenCalled();
    expect(db.state.revision).toBe(3);
  });
});
