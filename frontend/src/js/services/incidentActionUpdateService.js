import { api } from "./api.js";

export function getActionUpdates(id) {
  return api.get(`/api/incident_actions/${id}/updates`);
}

export function addActionUpdate(id, note) {
  return api.post(`/api/incident_actions/${id}/updates`, {
    note,
  });
}
