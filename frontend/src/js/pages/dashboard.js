// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------

import { getIncidentTypes } from "../services/incidentTypeService.js";
import { getIncidents } from "../services/incidentService.js";
import { formatDateTime } from "../utils/dateHandler.js";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

// let allIncidents = [];
const state = {
  search: "",
  status: "active",
  incidentType: "all",
  page: 1,
  limit: 10,
  paginationMeta: null,
  incidents: [],
  sseListenersRegistered: false,
  stats: null,
};
// let sseListenersRegistered = false;

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
    const [result] = await Promise.all([
      getIncidents({
        page: state.page,
        limit: state.limit,
        search: state.search || undefined,
        status: state.status === "all" ? undefined : state.status,
        incident_type_id:
          state.incidentType === "all" ? undefined : state.incidentType,
      }),
      loadIncidentTypes(),
    ]);

    state.incidents = result.data;
    state.paginationMeta = result.meta;
    state.stats = result.stats;

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
  const incidentTypeFilter = document.getElementById("incident-type-filter");
  const pageSizeSelect = document.getElementById("incident-page-size");
  const refreshButton = document.getElementById("btn-refresh-incidents");

  if (
    !searchInput ||
    !statusFilter ||
    !incidentTypeFilter ||
    !pageSizeSelect ||
    !refreshButton
  ) {
    return;
  }

  searchInput.value = state.search;
  statusFilter.value = state.status;
  incidentTypeFilter.value = state.incidentType;
  pageSizeSelect.value = String(state.limit);

  searchInput.oninput = async (event) => {
    state.search = event.target.value.trim();
    state.page = 1;

    await loadIncidents();
  };

  statusFilter.onchange = async (event) => {
    state.status = event.target.value;
    state.page = 1;

    await loadIncidents();
  };

  incidentTypeFilter.onchange = async (event) => {
    state.incidentType = event.target.value;
    state.page = 1;

    await loadIncidents();
  };

  pageSizeSelect.onchange = async (event) => {
    state.limit = Number(event.target.value) || 10;
    state.page = 1;

    await loadIncidents();
  };

  refreshButton.onclick = () => {
    loadIncidents();
  };
}

// -----------------------------------------------------------------------------
// Incident List
// -----------------------------------------------------------------------------

function renderIncidents(incidents = []) {
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
    ?.addEventListener("click", async () => {
      if (state.page <= 1) {
        return;
      }

      state.page -= 1;
      await loadIncidents();
    });

  document
    .getElementById("incident-page-next")
    ?.addEventListener("click", async () => {
      if (state.page >= pageCount) {
        return;
      }

      state.page += 1;
      await loadIncidents();
    });
}

function renderCurrentPage() {
  updateStatistics(state.stats);
  renderIncidents(state.incidents);
  renderPagination(state.paginationMeta);
}

async function loadIncidentTypes() {
  const select = document.getElementById("incident-type-filter");

  if (!select) {
    return [];
  }

  try {
    const types = await getIncidentTypes();

    select.innerHTML = `
      <option value="all">All types</option>
      ${types
        .map((type) => `<option value="${type.id}">${type.name}</option>`)
        .join("\n")}
    `;

    return types;
  } catch (err) {
    console.error(err);
    select.innerHTML = `
      <option value="all">All types</option>
    `;
    return [];
  }
}

// -----------------------------------------------------------------------------
// Dashboard Statistics
// -----------------------------------------------------------------------------

function updateStatistics(stats) {
  if (!stats) return;

  const activeIncidentCount = document.getElementById("active-incident-count");

  if (activeIncidentCount) {
    activeIncidentCount.textContent = stats.active;
  }

  const resolvedCount = document.getElementById("resolved-count");

  if (resolvedCount) {
    resolvedCount.textContent = stats.resolvedToday;
  }

  const openActionCount = document.getElementById("open-action-count");

  if (openActionCount) {
    openActionCount.textContent = stats.openWorkload;
  }
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

export function registerDashboardLiveUpdates() {
  if (state.sseListenersRegistered) return;

  window.addEventListener("incident-created", loadIncidents);

  window.addEventListener("incident-closed", loadIncidents);

  window.addEventListener("incident-action-updated", loadIncidents);

  window.addEventListener("incident-action-assigned", loadIncidents);

  state.sseListenersRegistered = true;
}
