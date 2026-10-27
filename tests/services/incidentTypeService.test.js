jest.mock("../../backend/data/repositories/incidentTypeRepository");
jest.mock("../../backend/data/repositories/planTemplateRepository");

const incidentTypeRepository = require("../../backend/data/repositories/incidentTypeRepository");
const planTemplateRepository = require("../../backend/data/repositories/planTemplateRepository");
const incidentTypeService = require("../../backend/services/incidentTypeService");

describe("IncidentTypeService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    incidentTypeRepository.db = {
      transaction: (callback) => callback,
    };
  });

  it("updates template titles when the incident type name changes", () => {
    incidentTypeRepository.findById.mockReturnValue({
      id: 5,
      name: "Old Name",
      description: "Old description",
    });

    const result = incidentTypeService.updateIncidentType(5, {
      name: "Updated Name",
      description: "Updated description",
    });

    expect(incidentTypeRepository.updateById).toHaveBeenCalledWith(5, {
      name: "Updated Name",
      description: "Updated description",
    });
    expect(
      planTemplateRepository.updateTitlesByIncidentType,
    ).toHaveBeenCalledWith(5, "Updated Name");
    expect(result).toEqual({
      id: 5,
      name: "Updated Name",
      description: "Updated description",
    });
  });

  it("does not update templates when the incident type does not exist", () => {
    incidentTypeRepository.findById.mockReturnValue(null);

    expect(
      incidentTypeService.updateIncidentType(5, { name: "Updated Name" }),
    ).toBeNull();
    expect(
      planTemplateRepository.updateTitlesByIncidentType,
    ).not.toHaveBeenCalled();
  });
});
