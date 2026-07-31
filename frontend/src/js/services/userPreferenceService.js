import { api } from "./api.js";

export function getPreferences() {
  return api.get("/api/me/preferences");
}

export function savePreferences(data) {
  return api.put("/api/me/preferences", data);
}
