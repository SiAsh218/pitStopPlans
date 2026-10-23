const {
  updateCcilSchema,
  updateTinSchema,
} = require("../../backend/validation/schemas");

describe.each([
  ["CCIL", updateCcilSchema, "ccil_number"],
  ["TIN", updateTinSchema, "tin_number"],
])("%s reference schema", (_name, schema, field) => {
  it("accepts digits", () => {
    expect(schema.safeParse({ [field]: "001234" }).success).toBe(true);
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
