import { getIncidents } from "../services/incidentService.js";

export async function loadIncidents() {
  const incidentList = document.getElementById("incident-list");

  if (!incidentList) {
    return;
  }

  try {
    const incidents = await getIncidents();

    incidents.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));

    updateStatistics(incidents);

    renderIncidents(incidents);
  } catch (err) {
    console.error(err);

    incidentList.innerHTML = `
      <p>Failed to load incidents.</p>
    `;
  }
}

function renderIncidents(incidents) {
  const container = document.getElementById("incident-list");

  container.innerHTML = "";

  if (incidents.length === 0) {
    container.innerHTML = `
      <p>No incidents found.</p>
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
        ${new Date(incident.started_at).toLocaleString()}
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

  const activeIncidentCount = document.getElementById("active-incident-count");

  if (activeIncidentCount) {
    activeIncidentCount.textContent = active;
  }

  const resolvedCount = document.getElementById("resolved-count");

  if (resolvedCount) {
    resolvedCount.textContent = closed;
  }

  const openActionCount = document.getElementById("open-action-count");

  if (openActionCount) {
    openActionCount.textContent = "-";
  }
}
