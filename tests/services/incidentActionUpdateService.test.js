jest.mock("../../backend/data/repositories/incidentActionRepository");
jest.mock("../../backend/data/repositories/incidentActionUpdateRepository");
jest.mock("../../backend/services/eventService");

const incidentActionRepository = require("../../backend/data/repositories/incidentActionRepository");
const incidentActionUpdateRepository = require("../../backend/data/repositories/incidentActionUpdateRepository");
const eventService = require("../../backend/services/eventService");
const incidentActionUpdateService = require("../../backend/services/incidentActionUpdateService");

describe("IncidentActionUpdateService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    incidentActionRepository.findById.mockReturnValue({
      id: 42,
      incident_id: 7,
    });
    incidentActionUpdateRepository.insert.mockReturnValue({
      lastInsertRowid: 100,
    });
    incidentActionUpdateRepository.findByIdWithDetails.mockReturnValue({
      id: 100,
      incident_action_id: 42,
      note: "Progress note",
    });
  });

  it("broadcasts an incident refresh after persisting a comment", () => {
    const result = incidentActionUpdateService.addComment(
      42,
      12,
      "Progress note",
    );

    expect(incidentActionUpdateRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        incident_action_id: 42,
        user_id: 12,
        update_type: "comment",
        note: "Progress note",
      }),
    );
    expect(eventService.broadcast).toHaveBeenCalledWith({
      type: "incident-action-updated",
      incidentId: 7,
    });
    expect(result).toEqual(
      expect.objectContaining({ id: 100, note: "Progress note" }),
    );
  });
});