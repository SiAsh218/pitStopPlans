import { logout } from "../auth.js";
import { getCurrentUser } from "../auth.js";

export function initHeader() {
  const buttonCreateTemplate = document.getElementById("create-template-btn");
  const buttonCreateIncident = document.getElementById("create-incident-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const dashboardBtn = document.getElementById("dashboard-nav-btn");
  const usersBtn = document.getElementById("users-nav-btn");

  const user = getCurrentUser();

  if (user?.role !== "admin") {
    usersBtn?.remove();
  } else {
    usersBtn.classList.remove("hidden");
  }

  buttonCreateTemplate?.addEventListener("click", () => {
    window.location.href = "/templates";
  });

  buttonCreateIncident?.addEventListener("click", () => {
    window.location.href = "/create-incident";
  });

  dashboardBtn?.addEventListener("click", () => {
    window.location.href = "/";
  });

  usersBtn?.addEventListener("click", () => {
    window.location.href = "/users";
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
