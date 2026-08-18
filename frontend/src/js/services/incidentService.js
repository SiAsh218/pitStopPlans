import { api } from "./api.js";

export function getIncidents(params = {}) {
  return api.get("/api/incidents", params, { raw: true });
}

export function getIncident(id) {
  return api.get(`/api/incidents/${id}`);
}

export function getDashboard(id) {
  return api.get(`/api/incidents/${id}/dashboard`);
}

export function createIncident(data) {
  return api.post("/api/incidents", data);
}

export function closeIncident(id) {
  return api.post(`/api/incidents/${id}/close`);
}

export function reopenIncident(id) {
  return api.post(`/api/incidents/${id}/reopen`);
}

export function updateIncidentCcil(id, ccilNumber) {
  return api.post(`/api/incidents/${id}/ccil`, {
    ccil_number: ccilNumber,
  });
}

export function updateIncidentTin(id, tinNumber) {
  return api.post(`/api/incidents/${id}/tin`, {
    tin_number: tinNumber,
  });
}

export async function updateIncidentMeta(incidentId, title, description) {
  return api.post(`/api/incidents/${incidentId}/meta`, {
    title,
    description,
  });
}
