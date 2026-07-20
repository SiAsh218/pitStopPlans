import { api } from "./api.js";

export function getIncidents() {
  return api.get("/api/incidents");
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
