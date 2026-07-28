import { logout } from "../auth.js";

export function initHeader() {
  const buttonCreateTemplate = document.getElementById("create-template-btn");
  const buttonCreateIncident = document.getElementById("create-incident-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const dashboardBtn = document.getElementById("dashboard-nav-btn");

  buttonCreateTemplate?.addEventListener("click", () => {
    window.location.href = "/templates";
  });

  buttonCreateIncident?.addEventListener("click", () => {
    window.location.href = "/create-incident";
  });

  dashboardBtn?.addEventListener("click", () => {
    window.location.href = "/";
  });

  const isDashboardPage = window.location.pathname === "/";

  if (isDashboardPage) {
    dashboardBtn?.classList.add("hidden");
  } else {
    dashboardBtn?.classList.remove("hidden");
    dashboardBtn?.style.removeProperty("display");
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}
