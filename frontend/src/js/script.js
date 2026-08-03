import "../css/variables.css";
import "../css/base.css";
import "../css/layout.css";
import "../css/components/header.css";
import "../css/components/buttons.css";
import "../css/components/cards.css";
import "../css/pages/incidents.css";
import "../css/components/modal.css";
import "../css/components/myAlert.css";
import "../css/components/statusBadge.css";
import "../css/pages/createIncident.css";
import "../css/pages/login.css";
import "../css/pages/users.css";
import "../css/pages/roles.css";
import "../css/pages/auditLog.css";

// AUTH
import login from "./login.js";
import { requireAuth } from "./auth.js";

// COMPONENTS
import { initHeader } from "./components/header.js";
import { initModal } from "./components/modal.js";

// PAGES
import { loadIncidents } from "./pages/dashboard.js";
import { initTemplatesPage } from "./pages/templates.js";
import { initIncidentPage } from "./pages/incident.js";
import { initCreateIncidentPage } from "./pages/createIncident.js";
import { initPlanTemplatePage } from "./pages/planTemplate.js";
import { initUsersPage } from "./pages/users.js";
import { initRolesPage } from "./pages/roles.js";
import { initAuditLogsPage } from "./pages/auditLog.js";

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await requireAuth())) {
    return;
  }

  initHeader();
  initTemplatesPage();
  loadIncidents();
  initModal();
  initIncidentPage();
  initCreateIncidentPage();
  initPlanTemplatePage();
  initUsersPage();
  initRolesPage();
  initAuditLogsPage();
});
