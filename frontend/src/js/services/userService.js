import { api } from "./api.js";

export async function getUsers(params = {}) {
  return api.get("/api/users", params, {
    raw: true,
  });
}

export async function getUser(id) {
  return api.get(`/api/users/${id}`);
}

export async function updateUserRoles(userId, roleIds) {
  return api.put(`/api/users/${userId}/roles`, {
    role_ids: roleIds,
  });
}

export async function createUser(email, password, role, roleIds = []) {
  return api.post("/api/users", {
    email,
    password,
    role,
    role_ids: roleIds,
  });
}

export async function updateUser(userId, data) {
  return api.put(`/api/users/${userId}`, data);
}
export async function disableUser(userId) {
  return api.put(`/api/users/${userId}/disable`, {});
}

export async function enableUser(userId) {
  return api.put(`/api/users/${userId}/enable`, {});
}
