import { api } from "./api.js";

export async function getAuditLogs(params = {}) {
  return api.get("/api/audit-logs", params, { raw: true });
}
