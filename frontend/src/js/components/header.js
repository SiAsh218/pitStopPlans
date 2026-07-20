import { logout } from "../auth.js";

export function initHeader() {
  const buttonCreateTemplate = document.getElementById("create-template-btn");
  const buttonCreateIncident = document.getElementById("create-incident-btn");
  const logoutBtn = document.getElementById("logout-btn");

  buttonCreateTemplate?.addEventListener("click", () => {
    window.location.href = "/create-plan-template";
  });

  buttonCreateIncident?.addEventListener("click", () => {
    window.location.href = "/create-incident";
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}
