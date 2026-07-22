import { api } from "./api.js";

export function getTemplates() {
  return api.get("/api/plan_templates");
}

export function getTemplate(id) {
  return api.get(`/api/plan_templates/${id}`);
}

export function cloneTemplate(id) {
  return api.post(`/api/plan_templates/${id}/clone`);
}

export function approveTemplate(id) {
  return api.post(`/api/plan_templates/${id}/approve`);
}

export function retireTemplate(id) {
  return api.post(`/api/plan_templates/${id}/retire`);
}

export async function getCurrentTemplates() {
  return api.get("/api/plan_templates/current");
}

export async function updateTemplate(id, data) {
  const response = await fetch(`/api/plan_templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update template");
  }

  return result.data;
}
