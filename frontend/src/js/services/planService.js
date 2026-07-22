import { api } from "./api.js";

export function getPlan(id) {
  return api.get(`/api/plans/${id}`);
}
