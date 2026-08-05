export function formatDateTime(dateInput) {
  const date = parseUtcDate(dateInput);

  if (!date) {
    return "-";
  }

  return date.toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });
}

export function parseUtcDate(dateInput) {
  if (!dateInput) {
    return null;
  }

  return typeof dateInput === "string"
    ? new Date(dateInput.replace(" ", "T") + "Z")
    : new Date(dateInput);
}
