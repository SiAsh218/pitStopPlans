import { api } from "./api.js";

export function getAction(id) {
  return api.get(`/api/incident_actions/${id}`);
}

export function startAction(id) {
  return api.post(`/api/incident_actions/${id}/start`);
}

export function completeAction(id) {
  return api.post(`/api/incident_actions/${id}/complete`);
}

export function reopenAction(id) {
  return api.post(`/api/incident_actions/${id}/reopen`);
}

export function assignAction(id, userId) {
  return api.post(`/api/incident_actions/${id}/assign`, {
    user_id: userId,
  });
}
