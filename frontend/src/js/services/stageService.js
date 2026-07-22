import { api } from "./api.js";

export async function updateStage(id, data) {
  return api.put(`/api/plan_stages/${id}`, data);
}

export async function createStage(data) {
  return api.post("/api/plan_stages", data);
}
