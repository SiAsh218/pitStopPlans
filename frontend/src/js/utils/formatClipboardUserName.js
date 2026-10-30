export function formatClipboardUserName(email) {
  const username = String(email || "User")
    .split("@", 1)[0]
    .replace(/\./g, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (!username) {
    return "User";
  }

  return username
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
