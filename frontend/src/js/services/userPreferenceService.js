import { api } from "./api.js";

export function getPreferences() {
  return api.get("/api/me/preferences");
}

export function savePreferences(data) {
  return api.put("/api/me/preferences", data);
}

export function cacheThemePreference(userId, theme) {
  if (userId == null) {
    return;
  }

  try {
    localStorage.setItem(`theme:${userId}`, theme);
  } catch (error) {
    console.warn("Could not cache the theme preference.", error);
  }
}
