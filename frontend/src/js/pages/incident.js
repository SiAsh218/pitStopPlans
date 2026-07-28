import { getDashboard, closeIncident } from "../services/incidentService.js";
import { formatDateTime } from "../utils/dateHandler.js";

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
    <div class="incident-meta__summary">
      <h1>${incident.title}</h1>

      <div class="incident-meta__meta">
        <span class="incident-meta__chip">Status: ${incident.status}</span>
        <span class="incident-meta__chip">Type: ${incident.incident_type.name}</span>
        <span class="incident-meta__chip">Template: v${incident.template.version}</span>
      </div>
    </div>

    <div class="incident-meta__actions">
      ${closeButton}
    </div>
  `;

  wireCloseIncidentButton(incident.id);
  wireDashboardBackButton();
}

function wireDashboardBackButton() {
  const button = document.getElementById("dashboard-nav-btn");

  if (!button) {
    return;
  }

  button.classList.add("is-visible");
  button.addEventListener("click", () => {
    window.location.assign("/");
  });
}

function renderSummary(summary) {
  const container = document.getElementById("incident-summary");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="card">
      <div class="incident-progress-header">
        <h3>Progress</h3>
        <span class="incident-progress-badge">
          ${summary.completion_percentage}% complete
        </span>
      </div>

      <div class="progress-bar">
        <div
          class="progress-bar__fill"
          style="
            width:
            ${summary.completion_percentage}%;
          "
        ></div>
      </div>

      <div class="incident-progress-metrics">
        <div class="incident-progress-metric">
          <strong>Total</strong>
          <span>${summary.total_actions}</span>
        </div>
        <div class="incident-progress-metric">
          <strong>Completed</strong>
          <span>${summary.completed_actions}</span>
        </div>
        <div class="incident-progress-metric">
          <strong>In Progress</strong>
          <span>${summary.in_progress_actions}</span>
        </div>
        <div class="incident-progress-metric">
          <strong>Pending</strong>
          <span>${summary.pending_actions}</span>
        </div>
      </div>
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
    const stageInfo = actions.find(
      (action) => action.stage_number === stageNumber,
    );

    html += `
    <tr>
      <td class="stage-label">

        <strong>
          Stage ${stageNumber}
        </strong>

        <br>

        <small>
          ${stageInfo?.stage_name ?? ""}
        </small>

        <br>

        <small>
          Due:
          ${stageInfo?.stage_due_from_incident_start ?? 0}
          mins
        </small>

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
        const roleNames = action.roles.map((role) => role.name).join(", ");
        const dueLabel =
          action.due_from_stage_start != null
            ? `${action.due_from_stage_start} mins from stage start`
            : `${action.due_from_incident_start} mins from incident start`;

        html += `
            <div
              class="matrix-action matrix-action--${action.status}"
              data-action-id="${action.id}"
            >
              <div class="matrix-action__title">
                ${action.title}
              </div>

              <div class="matrix-action__meta">
                <span class="matrix-action__status">${action.status}</span>
                <span class="matrix-action__due">${dueLabel}</span>
              </div>

              <div class="matrix-action__roles">
                ${roleNames}
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
  const overlay = document.getElementById("incident-action-overlay");
  const panel = document.getElementById("incident-action-panel");

  if (!overlay || !panel) {
    return;
  }

  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  panel.innerHTML = "";

  let buttons = "";

  if (action.status === "pending") {
    buttons = `
      <div class="action-panel__buttons">
        <button
          class="btn btn-primary"
          id="btn-start-action"
        >
          Start Action
        </button>
        <button
          class="btn btn-secondary"
          id="btn-add-update-inline"
        >
          Add Update
        </button>
      </div>
    `;
  }

  if (action.status === "in_progress") {
    buttons = `
      <div class="action-panel__buttons">
        <button
          class="btn btn-primary"
          id="btn-complete-action"
        >
          Complete Action
        </button>
        <button
          class="btn btn-secondary"
          id="btn-add-update-inline"
        >
          Add Update
        </button>
      </div>
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
        Quick Update
      </h3>
      <textarea
        id="action-update-note"
        class="modal-form__input"
        placeholder="Add a progress update..."
      ></textarea>
      <div class="action-panel__buttons">
        <button
          class="btn btn-primary"
          id="btn-add-update"
        >
          Save Update
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
    .querySelector(".incident-action-modal__close")
    ?.addEventListener("click", () => {
      closeActionModal();
    });

  document
    .getElementById("incident-action-overlay")
    ?.addEventListener("click", (event) => {
      if (event.target.id === "incident-action-overlay") {
        closeActionModal();
      }
    });
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

  document
    .getElementById("btn-add-update-inline")
    ?.addEventListener("click", () => {
      const textarea = document.getElementById("action-update-note");

      if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
}

function closeActionModal() {
  const overlay = document.getElementById("incident-action-overlay");

  if (!overlay) {
    return;
  }

  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  document.getElementById("incident-action-panel").innerHTML = "";
}

function wireUpdateButton(actionId) {
  const button = document.getElementById("btn-add-update");
  const textarea = document.getElementById("action-update-note");

  button?.addEventListener("click", async () => {
    const note = textarea?.value.trim();

    if (!note) {
      textarea?.focus();
      return;
    }

    try {
      await addActionUpdate(actionId, note);

      if (textarea) {
        textarea.value = "";
      }

      await openActionPanel(actionId);
    } catch (err) {
      console.error(err);
    }
  });

  textarea?.addEventListener("keydown", async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      button?.click();
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

// function formatDateTime(dateString) {
//   if (!dateString) {
//     return "-";
//   }

//   const utcDate = new Date(dateString.replace(" ", "T") + "Z");

//   return utcDate.toLocaleString("en-GB", {
//     timeZone: "Europe/London",
//   });
// }

async function refreshIncidentPage() {
  const incidentId = window.location.pathname.split("/").pop();

  const dashboard = await getDashboard(incidentId);

  renderIncidentMeta(dashboard);

  renderSummary(dashboard.summary);

  renderActions(dashboard.actions);
}
