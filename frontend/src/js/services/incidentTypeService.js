import { api } from "./api.js";

export function getIncidentTypes() {
  return api.get("/api/incident-types");
}

export function updateIncidentType(id, data) {
  return api.put(`/api/incident_types/${id}`, data);
}
