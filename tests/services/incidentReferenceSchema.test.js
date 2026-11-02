const {
  createIncidentSchema,
  markActionUpdatesReadSchema,
  updateCcilSchema,
  updateNearestStationSchema,
  updateTinSchema,
} = require("../../backend/validation/schemas");

describe.each([
  ["CCIL", updateCcilSchema, "ccil_number"],
  ["TIN", updateTinSchema, "tin_number"],
])("%s reference schema", (_name, schema, field) => {
  it("accepts digits", () => {
    expect(schema.safeParse({ [field]: "001234" }).success).toBe(true);
  });

  describe("nearest station schemas", () => {
    it("allows the optional station to be omitted when creating an incident", () => {
      expect(
        createIncidentSchema.safeParse({
          incident_type_id: 1,
          title: "Incident",
        }).success,
      ).toBe(true);
    });

    describe("mark action updates read schema", () => {
      it("accepts a positive comment ID", () => {
        expect(
          markActionUpdatesReadSchema.safeParse({
            update_ids: [15],
          }).success,
        ).toBe(true);
      });

      it("rejects invalid comment IDs", () => {
        expect(
          markActionUpdatesReadSchema.safeParse({
            update_ids: [0],
          }).success,
        ).toBe(false);
      });
    });

    it("accepts only station names from the shared station list", () => {
      expect(
        updateNearestStationSchema.safeParse({
          nearest_station: "Reading",
        }).success,
      ).toBe(true);
      expect(
        updateNearestStationSchema.safeParse({
          nearest_station: "NA",
        }).success,
      ).toBe(true);
      expect(
        updateNearestStationSchema.safeParse({
          nearest_station: "Unknown station",
        }).success,
      ).toBe(false);
    });

    it("allows the station to be cleared", () => {
      expect(
        updateNearestStationSchema.safeParse({
          nearest_station: null,
        }).success,
      ).toBe(true);
    });
  });

  it("accepts and normalizes NA", () => {
    const result = schema.safeParse({ [field]: " na " });

    expect(result.success).toBe(true);
    expect(result.data[field]).toBe("NA");
  });

  it("rejects other characters", () => {
    expect(schema.safeParse({ [field]: "12A4" }).success).toBe(false);
    expect(schema.safeParse({ [field]: "NA-1" }).success).toBe(false);
  });
});
