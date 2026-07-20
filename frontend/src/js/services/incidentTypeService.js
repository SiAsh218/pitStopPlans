import { api } from "./api.js";

export function getIncidentTypes() {
  return api.get("/api/incident-types");
}
