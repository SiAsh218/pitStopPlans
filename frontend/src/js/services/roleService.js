import { api } from "./api.js";

export function getRolesFromDB() {
  return api.get("/api/roles");
}

export function createRole(data) {
  return api.post("/api/roles", data);
}

export function updateRole(id, data) {
  return api.put(`/api/roles/${id}`, data);
}

export function deleteRole(id) {
  return api.delete(`/api/roles/${id}`);
}
