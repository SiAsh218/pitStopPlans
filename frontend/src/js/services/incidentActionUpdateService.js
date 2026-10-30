import { api } from "./api.js";

export function getActionUpdates(id, params = null) {
  return api.get(`/api/incident_actions/${id}/updates`, params);
}

export function getIncidentActionUpdates(incidentId) {
  return api.get(`/api/incidents/${incidentId}/action-updates`);
}

export function addActionUpdate(id, note) {
  return api.post(`/api/incident_actions/${id}/updates`, {
    note,
  });
}
