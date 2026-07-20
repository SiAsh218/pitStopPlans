import { api } from "./api.js";

export function getRolesFromDB() {
  return api.get("/api/roles");
}
