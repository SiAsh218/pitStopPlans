import { getCurrentUser, logout } from "../auth.js";
import {
  getPreferences,
  savePreferences,
} from "../services/userPreferenceService.js";
import { showError } from "../utils/myAlert.js";

export async function initHeader() {
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
  const themeToggle = document.getElementById("theme-toggle");

  const user = getCurrentUser();

  let isDarkMode = false;

  try {
    const preferences = await getPreferences();
    isDarkMode = preferences.theme === "dark";
    applyTheme(isDarkMode);
  } catch (error) {
    showError(error?.message || "Failed to load your display preferences.");
  }

  updateThemeToggle(themeToggle, isDarkMode);

  themeToggle?.addEventListener("click", async () => {
    const previousTheme = isDarkMode;
    isDarkMode = !isDarkMode;
    applyTheme(isDarkMode);
    updateThemeToggle(themeToggle, isDarkMode);
    themeToggle.disabled = true;

    try {
      await savePreferences({ theme: isDarkMode ? "dark" : "light" });
    } catch (error) {
      isDarkMode = previousTheme;
      applyTheme(isDarkMode);
      updateThemeToggle(themeToggle, isDarkMode);
      showError(error?.message || "Failed to save your display preference.");
    } finally {
      themeToggle.disabled = false;
    }
  });

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

function applyTheme(isDarkMode) {
  if (isDarkMode) {
    document.documentElement.dataset.theme = "dark";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function updateThemeToggle(button, isDarkMode) {
  if (!button) {
    return;
  }

  button.setAttribute("aria-pressed", String(isDarkMode));
  button.setAttribute("aria-label", "Dark mode");
}
