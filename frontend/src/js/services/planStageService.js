import { api } from "./api.js";

export async function updateStage(id, data) {
  const result = await api.put(`/api/plan_stages/${id}`, data);

  return result.data;
}

export async function createStage(data) {
  const result = await api.post("/api/plan_stages", data);

  return result.data;
}

export async function deleteStage(id) {
  return api.delete(`/api/plan_stages/${id}`);
}
