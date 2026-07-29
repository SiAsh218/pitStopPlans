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
});

import { incidentState } from "./state/incidentState.js";

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    console.log("incidentState", incidentState);
  }
});
