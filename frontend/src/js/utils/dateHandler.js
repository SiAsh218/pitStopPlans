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

  let date;

  if (typeof dateInput === "string") {
    const normalized = dateInput.replace(" ", "T");
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);

    date = new Date(hasTimezone ? normalized : `${normalized}Z`);
  } else {
    date = new Date(dateInput);
  }

  return Number.isNaN(date.getTime()) ? null : date;
}
