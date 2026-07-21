import { getDashboard, closeIncident } from "../services/incidentService.js";

import {
  getAction,
  startAction,
  completeAction,
} from "../services/incidentActionService.js";

import {
  getActionUpdates,
  addActionUpdate,
} from "../services/incidentActionUpdateService.js";

export async function initIncidentPage() {
  const incidentMeta = document.querySelector(".incident-meta");

  if (!incidentMeta) {
    return;
  }

  try {
    const incidentId = window.location.pathname.split("/").pop();

    const dashboard = await getDashboard(incidentId);

    renderIncidentMeta(dashboard);

    renderActions(dashboard.actions);

    renderSummary(dashboard.summary);
  } catch (err) {
    console.error(err);

    incidentMeta.innerHTML = `
      <p>Failed to load incident.</p>
    `;
  }
}

function renderIncidentMeta(dashboard) {
  const incident = dashboard.incident;

  const container = document.querySelector(".incident-meta");

  if (!container) {
    return;
  }

  const closeButton =
    incident.status === "closed"
      ? ""
      : `
        <button
          class="btn btn-primary"
          id="btn-close-incident"
        >
          Close Incident
        </button>
      `;

  container.innerHTML = `
    <h1>
      ${incident.title}
    </h1>

    <p>
      <strong>Status:</strong>
      ${incident.status}
    </p>

    <p>
      <strong>Type:</strong>
      ${incident.incident_type.name}
    </p>

    <p>
      <strong>Template Version:</strong>
      ${incident.template.version}
    </p>

    ${closeButton}
  `;

  wireCloseIncidentButton(incident.id);
}

function renderSummary(summary) {
  const container = document.getElementById("incident-summary");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="card">
      <h3>Progress</h3>

      <div class="progress-bar">
        <div
          class="progress-bar__fill"
          style="
            width:
            ${summary.completion_percentage}%;
          "
        ></div>
      </div>

      <p>
        Completion:
        ${summary.completion_percentage}%
      </p>

      <p>
        Total Actions:
        ${summary.total_actions}
      </p>

      <p>
        Completed:
        ${summary.completed_actions}
      </p>

      <p>
        In Progress:
        ${summary.in_progress_actions}
      </p>

      <p>
        Pending:
        ${summary.pending_actions}
      </p>
    </div>
  `;
}

function renderActions(actions) {
  const container = document.getElementById("incident-actions");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!actions.length) {
    container.innerHTML = "<p>No actions found.</p>";

    return;
  }

  const roles = [
    ...new Set(
      actions.flatMap((action) => action.roles.map((role) => role.name)),
    ),
  ];

  const stages = [
    ...new Set(actions.map((action) => action.stage_number)),
  ].sort((a, b) => a - b);

  const table = document.createElement("table");

  table.className = "incident-matrix";

  let html = `
    <thead>
      <tr>
        <th>Stage</th>
  `;

  roles.forEach((role) => {
    html += `<th>${role}</th>`;
  });

  html += `
      </tr>
    </thead>
    <tbody>
  `;

  stages.forEach((stageNumber) => {
    html += `
      <tr>
        <td class="stage-label">
          Stage ${stageNumber}
        </td>
    `;

    roles.forEach((roleName) => {
      const matchingActions = actions.filter(
        (action) =>
          action.stage_number === stageNumber &&
          action.roles.some((role) => role.name === roleName),
      );

      html += `
        <td>
      `;

      matchingActions.forEach((action) => {
        html += `
            <div
              class="matrix-action matrix-action--${action.status}"
              data-action-id="${action.id}"
            >
              <div class="matrix-action__title">
                ${action.title}
              </div>

              <div class="matrix-action__status">
                ${action.status}
              </div>
            </div>
          `;
      });

      html += `
        </td>
      `;
    });

    html += `
      </tr>
    `;
  });

  html += `
    </tbody>
  `;

  table.innerHTML = html;

  container.appendChild(table);

  wireActionCards();
}

function wireActionCards() {
  document.querySelectorAll(".matrix-action").forEach((card) => {
    card.addEventListener("click", () => {
      const actionId = card.dataset.actionId;

      console.log("Selected Action:", actionId);

      openActionPanel(actionId);
    });
  });
}

async function openActionPanel(actionId) {
  try {
    const action = await getAction(actionId);

    const updates = await getActionUpdates(actionId);

    renderActionPanel(action, updates);
  } catch (err) {
    console.error(err);
  }
}

function renderActionPanel(action, updates = []) {
  const panel = document.getElementById("incident-action-panel");

  if (!panel) {
    return;
  }

  panel.classList.remove("hidden");

  let buttons = "";

  if (action.status === "pending") {
    buttons = `
      <button
        class="btn btn-primary"
        id="btn-start-action"
      >
        Start Action
      </button>
    `;
  }

  if (action.status === "in_progress") {
    buttons = `
      <button
        class="btn btn-primary"
        id="btn-complete-action"
      >
        Complete Action
      </button>
    `;
  }

  if (action.status === "completed") {
    buttons = `
      <p>
        ✅ Action Completed
      </p>
    `;
  }

  const updatesHtml =
    updates.length === 0
      ? `
      <p>No updates yet.</p>
    `
      : updates
          .map(
            (update) => `
            <div class="action-update">

              <p>
                <strong>
                  ${update.user_email ?? "User"}
                </strong>
              </p>

              <p>
                ${update.note}
              </p>

              <small>
                ${formatDateTime(update.created_at)}
              </small>

            </div>
          `,
          )
          .join("");

  panel.innerHTML = `
    <div class="card">
      <h2>
        ${action.title}
      </h2>
      <p>
        ${action.description ?? ""}
      </p>
      <p>
        <strong>Status:</strong>
        ${action.status}
      </p>
      <p>
        <strong>Due From Incident Start:</strong>
        ${action.due_from_incident_start} mins
      </p>
      <p>
        <strong>Started:</strong>
        ${formatDateTime(action.started_at)}
      </p>
      <p>
        <strong>Completed:</strong>
        ${formatDateTime(action.completed_at)}
      </p>
      <p>
        <strong>Assigned User:</strong>
        ${action.assigned_user_id ?? "-"}
      </p>
      <h3>
        Updates
      </h3>
      <div class="action-updates">
        ${updatesHtml}
      </div>
      <h3>
        Add Update
      </h3>
      <textarea
        id="action-update-note"
        class="modal-form__input"
      ></textarea>
      <div class="action-panel__buttons">
        <button
          class="btn btn-primary"
          id="btn-add-update"
        >
          Add Update
        </button>
        ${buttons}
      </div>
    </div>
  `;

  wireActionButtons(action.id);

  wireUpdateButton(action.id);
}

function wireActionButtons(actionId) {
  document
    .getElementById("btn-start-action")
    ?.addEventListener("click", async () => {
      try {
        await startAction(actionId);

        await refreshIncidentPage();

        await openActionPanel(actionId);
      } catch (err) {
        console.error(err);
      }
    });

  document
    .getElementById("btn-complete-action")
    ?.addEventListener("click", async () => {
      try {
        await completeAction(actionId);

        await refreshIncidentPage();

        await openActionPanel(actionId);
      } catch (err) {
        console.error(err);
      }
    });
}

function wireUpdateButton(actionId) {
  document
    .getElementById("btn-add-update")
    ?.addEventListener("click", async () => {
      const note = document.getElementById("action-update-note")?.value.trim();

      if (!note) {
        return;
      }

      try {
        await addActionUpdate(actionId, note);

        await openActionPanel(actionId);
      } catch (err) {
        console.error(err);
      }
    });
}

function wireCloseIncidentButton(incidentId) {
  document
    .getElementById("btn-close-incident")
    ?.addEventListener("click", async () => {
      const confirmed = window.confirm("Close this incident?");

      if (!confirmed) {
        return;
      }

      try {
        await closeIncident(incidentId);

        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    });
}

function formatDateTime(dateString) {
  if (!dateString) {
    return "-";
  }

  const utcDate = new Date(dateString.replace(" ", "T") + "Z");

  return utcDate.toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });
}

async function refreshIncidentPage() {
  const incidentId = window.location.pathname.split("/").pop();

  const dashboard = await getDashboard(incidentId);

  renderIncidentMeta(dashboard);

  renderSummary(dashboard.summary);

  renderActions(dashboard.actions);
}
