// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

import { getIncidents } from "../services/incidentService.js";
import { formatDateTime } from "../utils/dateHandler.js";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

let allIncidents = [];
const state = {
  search: "",
  status: "active",
  page: 1,
  limit: 10,
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
    renderCurrentPage();
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
  const pageSizeSelect = document.getElementById("incident-page-size");
  const refreshButton = document.getElementById("btn-refresh-incidents");

  if (!searchInput || !statusFilter || !pageSizeSelect || !refreshButton) {
    return;
  }

  searchInput.value = state.search;
  statusFilter.value = state.status;
  pageSizeSelect.value = String(state.limit);

  searchInput.oninput = (event) => {
    state.search = event.target.value.trim().toLowerCase();
    state.page = 1;
    renderCurrentPage();
  };

  statusFilter.onchange = (event) => {
    state.status = event.target.value;
    state.page = 1;
    renderCurrentPage();
  };

  pageSizeSelect.onchange = (event) => {
    state.limit = Number(event.target.value) || 10;
    state.page = 1;
    renderCurrentPage();
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
      state.status === "all" || incident.status === state.status;
    const searchTerm = state.search;
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

function renderPagination(meta = {}) {
  const container = document.getElementById("incident-pagination");

  if (!container) {
    return;
  }

  if (!meta || meta.total === 0) {
    container.innerHTML = "";
    return;
  }

  const currentPage = meta.page || 1;
  const pageCount = meta.pageCount || 1;

  container.innerHTML = `
    <div class="pagination">
      <button id="incident-page-prev" class="btn btn-secondary" ${
        currentPage <= 1 ? "disabled" : ""
      }>
        Previous
      </button>

      <span class="pagination__summary">
        Page ${currentPage} of ${pageCount} • ${meta.total} incidents
      </span>

      <button id="incident-page-next" class="btn btn-secondary" ${
        currentPage >= pageCount ? "disabled" : ""
      }>
        Next
      </button>
    </div>
  `;

  document
    .getElementById("incident-page-prev")
    ?.addEventListener("click", () => {
      if (state.page <= 1) {
        return;
      }

      state.page -= 1;
      renderCurrentPage();
    });

  document
    .getElementById("incident-page-next")
    ?.addEventListener("click", () => {
      if (state.page >= pageCount) {
        return;
      }

      state.page += 1;
      renderCurrentPage();
    });
}

function getPaginatedIncidents(filteredIncidents) {
  const total = filteredIncidents.length;
  const pageCount = Math.max(1, Math.ceil(total / state.limit));
  const page = Math.min(Math.max(1, state.page), pageCount);
  const offset = (page - 1) * state.limit;
  const rows = filteredIncidents.slice(offset, offset + state.limit);

  return {
    rows,
    meta: {
      total,
      limit: state.limit,
      page,
      pageCount,
    },
  };
}

function renderCurrentPage() {
  const filtered = getFilteredIncidents();
  const { rows, meta } = getPaginatedIncidents(filtered);

  updateStatistics(filtered);
  renderIncidents(rows);
  renderPagination(meta);
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
