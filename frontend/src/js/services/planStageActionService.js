import { api } from "./api.js";

export function createAction(data) {
  return api.post("/api/plan_stage_actions", data);
}

export function updateAction(id, data) {
  return api.put(`/api/plan_stage_actions/${id}`, data);
}

export function deleteAction(id) {
  return api.delete(`/api/plan_stage_actions/${id}`);
}
