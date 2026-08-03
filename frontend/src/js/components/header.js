import { logout } from "../auth.js";
import { getCurrentUser } from "../auth.js";

export function initHeader() {
  const buttonCreateTemplate = document.getElementById("create-template-btn");
  const buttonCreateIncident = document.getElementById("create-incident-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const dashboardBtn = document.getElementById("dashboard-nav-btn");
  const usersBtn = document.getElementById("users-nav-btn");
  const auditLogBtn = document.getElementById("audit-log-btn");
  const operationalRolesBtn = document.getElementById(
    "operational-roles-nav-btn",
  );
  const adminActionsDropdown = document.getElementById(
    "admin-actions-dropdown",
  );
  const adminActionsToggle = document.getElementById("admin-actions-toggle");
  const adminActionsMenu = document.getElementById("admin-actions-menu");

  const user = getCurrentUser();

  if (user?.role !== "admin") {
    adminActionsDropdown?.remove();
  } else {
    adminActionsDropdown?.classList.remove("hidden");
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

  auditLogBtn?.addEventListener("click", () => {
    window.location.href = "/audit-log";
  });

  adminActionsToggle?.addEventListener("click", () => {
    adminActionsMenu?.classList.toggle("hidden");
  });

  operationalRolesBtn?.addEventListener("click", () => {
    window.location.href = "/roles";
  });

  adminActionsMenu?.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.id === "operational-roles-nav-btn") {
      window.location.href = "/roles";
    }
  });

  document.addEventListener("click", (event) => {
    if (
      adminActionsMenu &&
      adminActionsToggle &&
      !adminActionsMenu.contains(event.target) &&
      !adminActionsToggle.contains(event.target)
    ) {
      adminActionsMenu.classList.add("hidden");
    }
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
