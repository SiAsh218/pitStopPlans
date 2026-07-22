export function formatDateTime(dateInput) {
  if (!dateInput) {
    return "-";
  }

  const date =
    typeof dateInput === "string"
      ? new Date(dateInput.replace(" ", "T") + "Z")
      : new Date(dateInput);

  return date.toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });
}
