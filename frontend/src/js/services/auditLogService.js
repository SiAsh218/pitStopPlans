import { api } from "./api.js";

export async function getAuditLogs() {
  return api.get("api/audit-logs");
}
