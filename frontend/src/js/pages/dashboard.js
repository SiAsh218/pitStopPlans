// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

import { getIncidents } from "../services/incidentService.js";
import { formatDateTime } from "../utils/dateHandler.js";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

let allIncidents = [];
let filters = {
  search: "",
  status: "active",
};

// -----------------------------------------------------------------------------
// Initialisation
// -----------------------------------------------------------------------------

export async function loadIncidents() {
  const incidentList = document.getElementById("incident-list");

  if (!incidentList) {
    return;
  }

  try {
    incidentList.innerHTML = "<p>Loading incidents...</p>";

    const incidents = await getIncidents();

    allIncidents = incidents.sort(
      (a, b) => new Date(b.started_at) - new Date(a.started_at),
    );

    bindDashboardControls();
    updateStatistics(allIncidents);
    renderIncidents(getFilteredIncidents());
  } catch (err) {
    showDashboardError(incidentList, err);
  }
}

// -----------------------------------------------------------------------------
// Dashboard Controls
// -----------------------------------------------------------------------------

function bindDashboardControls() {
  const searchInput = document.getElementById("incident-search");
  const statusFilter = document.getElementById("incident-status-filter");
  const refreshButton = document.getElementById("btn-refresh-incidents");

  if (!searchInput || !statusFilter || !refreshButton) {
    return;
  }

  searchInput.value = filters.search;
  statusFilter.value = filters.status;

  searchInput.oninput = (event) => {
    filters.search = event.target.value.trim().toLowerCase();
    renderIncidents(getFilteredIncidents());
  };

  statusFilter.onchange = (event) => {
    filters.status = event.target.value;
    renderIncidents(getFilteredIncidents());
  };

  refreshButton.onclick = () => {
    loadIncidents();
  };
}

// -----------------------------------------------------------------------------
// Incident List
// -----------------------------------------------------------------------------

function getFilteredIncidents() {
  return allIncidents.filter((incident) => {
    const matchesStatus =
      filters.status === "all" || incident.status === filters.status;

    const searchTerm = filters.search;
    const matchesSearch =
      searchTerm.length === 0 ||
      [incident.title, incident.incident_type?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm));

    return matchesStatus && matchesSearch;
  });
}

function renderIncidents(incidents) {
  const container = document.getElementById("incident-list");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (incidents.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        <p>No incidents match your current filters.</p>
      </div>
    `;

    return;
  }

  incidents.forEach((incident) => {
    const card = document.createElement("div");

    card.className = "incident-card";

    card.innerHTML = buildIncidentCard(incident);

    card.addEventListener("click", () => {
      openIncident(incident.id);
    });

    container.appendChild(card);
  });
}

// -----------------------------------------------------------------------------
// Dashboard Statistics
// -----------------------------------------------------------------------------

function updateStatistics(incidents) {
  const active = incidents.filter(
    (incident) => incident.status === "active",
  ).length;

  const resolvedToday = getResolvedTodayCount(incidents);

  const openWorkload = getOpenWorkload(incidents);

  const activeIncidentCount = document.getElementById("active-incident-count");

  if (activeIncidentCount) {
    activeIncidentCount.textContent = active;
  }

  const resolvedCount = document.getElementById("resolved-count");

  if (resolvedCount) {
    resolvedCount.textContent = resolvedToday;
  }

  const openActionCount = document.getElementById("open-action-count");

  if (openActionCount) {
    openActionCount.textContent = openWorkload;
  }
}

function getResolvedTodayCount(incidents) {
  const today = new Date();

  return incidents.filter((incident) => {
    if (incident.status !== "closed" || !incident.closed_at) {
      return false;
    }

    const closedDate = new Date(incident.closed_at);

    return (
      closedDate.getFullYear() === today.getFullYear() &&
      closedDate.getMonth() === today.getMonth() &&
      closedDate.getDate() === today.getDate()
    );
  }).length;
}

function getOpenWorkload(incidents) {
  return incidents
    .filter((incident) => incident.status === "active")
    .reduce((total, incident) => {
      const remaining =
        incident.summary.total_actions - incident.summary.completed_actions;

      return total + remaining;
    }, 0);
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function showDashboardError(container, err) {
  console.error(err);

  container.innerHTML = `
    <p>Failed to load incidents.</p>
  `;
}

function buildIncidentCard(incident) {
  const statusClass =
    incident.status === "active" ? "status--active" : "status--closed";

  return `
      <div class="incident-card__header">
        <h3>
          #${incident.id}
          ${incident.title}
        </h3>

        <span
          class="status-badge ${statusClass}"
        >
          ${incident.status}
        </span>
      </div>

      <p>
        <strong>Type:</strong>
        ${incident.incident_type.name}
      </p>

      <p>
        <strong>Started:</strong>
        ${formatDateTime(incident.started_at)}
      </p>

      <div class="progress-bar">
        <div
          class="progress-bar__fill"
          style="
            width:
            ${incident.summary.completion_percentage}%;
          "
        ></div>
      </div>

      <small>
        ${incident.summary.completed_actions}
        /
        ${incident.summary.total_actions}
        actions completed
      </small>

      <div class="incident-card__actions">
        <button
          class="btn btn-primary btn--view-incident"
        >
          View Incident
        </button>
      </div>
    `;
}

function openIncident(incidentId) {
  window.location.href = `/incidents/${incidentId}`;
}
