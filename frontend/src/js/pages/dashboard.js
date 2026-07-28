import { getIncidents } from "../services/incidentService.js";
import { formatDateTime } from "../utils/dateHandler.js";

let allIncidents = [];
let filters = {
  search: "",
  status: "active",
};

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
    console.error(err);

    incidentList.innerHTML = `
      <p>Failed to load incidents.</p>
    `;
  }
}

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

    const statusClass =
      incident.status === "active" ? "status--active" : "status--closed";

    card.innerHTML = `
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

      <button
        class="btn btn-primary btn--view-incident"
      >
        View Incident
      </button>
    `;

    card.addEventListener("click", () => {
      window.location.href = `/incidents/${incident.id}`;
    });

    container.appendChild(card);
  });
}

function updateStatistics(incidents) {
  const active = incidents.filter(
    (incident) => incident.status === "active",
  ).length;

  const closed = incidents.filter(
    (incident) => incident.status === "closed",
  ).length;

  const today = new Date();
  const resolvedToday = incidents.filter((incident) => {
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
    openActionCount.textContent = active;
  }
}
