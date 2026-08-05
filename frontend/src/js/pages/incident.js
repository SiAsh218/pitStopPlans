// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
import { getDashboard, closeIncident } from "../services/incidentService.js";
import { formatDateTime, parseUtcDate } from "../utils/dateHandler.js";
import { showWarning, showError } from "../utils/myAlert.js";
import { showConfirm } from "../modals/modalConfirm.js";
import { getCurrentUser } from "../auth.js";

import {
  getPreferences,
  savePreferences,
} from "../services/userPreferenceService.js";

import {
  getAction,
  startAction,
  completeAction,
  reopenAction,
} from "../services/incidentActionService.js";

import {
  getActionUpdates,
  addActionUpdate,
} from "../services/incidentActionUpdateService.js";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

let currentPreferences = {};
let selectedRoles = [];
let currentActions = [];
let saveTimeout;
let incidentTimerInterval;
let incidentTimerTimeout;
let sseListenersRegistered = false;
let currentUser = null;
let incidentStartedAt = null;
let currentSummary = null;

// -----------------------------------------------------------------------------
// Initialisation
// -----------------------------------------------------------------------------

export async function initIncidentPage() {
  const incidentMeta = document.querySelector(".incident-meta");
  const preferences = await getPreferences();

  currentPreferences = preferences;
  selectedRoles = currentPreferences?.incidentMatrix?.visibleRoles ?? [];

  if (!incidentMeta) {
    return;
  }

  registerLiveUpdateListeners();

  try {
    const incidentId = window.location.pathname.split("/").pop();
    const dashboard = await getDashboard(incidentId);
    currentSummary = dashboard.summary;

    renderIncidentMeta(dashboard);
    renderActions(dashboard.actions);
    renderSummary(dashboard.summary);
    currentUser = getCurrentUser();
  } catch (err) {
    showUnexpectedError(err);

    incidentMeta.innerHTML = `
      <p>Failed to load incident.</p>
    `;
  }
}

export async function refreshIncidentPage() {
  const incidentId = window.location.pathname.split("/").pop();
  const dashboard = await getDashboard(incidentId);

  currentSummary = dashboard.summary;

  renderIncidentMeta(dashboard);
  renderSummary(dashboard.summary);
  renderActions(dashboard.actions);
}

// -----------------------------------------------------------------------------
// Incident Header
// -----------------------------------------------------------------------------

function renderIncidentMeta(dashboard) {
  const incident = dashboard.incident;
  incidentStartedAt = incident.started_at;
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
        <span class="incident-meta__chip" id="incident-duration"> 🕒 Loading...</span></div>
    </div>

    <div class="incident-meta__actions">
      ${closeButton}
    </div>
  `;

  wireCloseIncidentButton(incident.id);
  wireDashboardBackButton();
  startIncidentTimer(formatDateTime(incident.started_at));
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

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------

function renderSummary(summary) {
  const container = document.getElementById("incident-summary");

  if (!container) {
    return;
  }

  const overdueCount = getOverdueActionCount(currentActions);

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
        <div class="incident-progress-metric ${overdueCount > 0 ? "incident-progress-metric--overdue" : ""}">
          <strong>Overdue</strong>
          <span>${overdueCount}</span>
        </div>
        <div class="incident-progress-metric">
          <strong>Pending</strong>
          <span>${summary.pending_actions}</span>
        </div>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// Incident Matrix
// -----------------------------------------------------------------------------

function renderActions(actions) {
  const container = document.getElementById("incident-actions");

  if (!container) {
    return;
  }

  currentActions = actions;
  const allRoles = getAllRoles(actions);

  renderRolePicker(allRoles);

  if (!actions.length) {
    container.innerHTML = "<p>No actions found.</p>";
    return;
  }

  const roles = getVisibleRoles(allRoles);
  const stages = getStages(actions);
  const table = document.createElement("table");

  table.className = "incident-matrix";
  table.innerHTML = buildMatrixTable(actions, roles, stages);
  container.innerHTML = "";
  container.appendChild(table);

  wireActionCards();
  wireStartActionButtons();
  wireCompleteActionButtons();
}

function wireActionCards() {
  document.querySelectorAll(".matrix-action").forEach((card) => {
    card.addEventListener("click", () => {
      const actionId = card.dataset.actionId;

      openActionPanel(actionId);
    });
  });
}

function wireStartActionButtons() {
  document.querySelectorAll(".btn-start-action-card").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();

      try {
        await startAction(button.dataset.actionId);
        await refreshIncidentPage();
      } catch (err) {
        showUnexpectedError(err);
        return;
      }
    });
  });
}

function wireCompleteActionButtons() {
  document.querySelectorAll(".btn-complete-action-card").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();

      try {
        await completeAction(button.dataset.actionId);
        await refreshIncidentPage();
      } catch (err) {
        showUnexpectedError(err);
      }
    });
  });
}

// -----------------------------------------------------------------------------
// Action Panel
// -----------------------------------------------------------------------------

async function openActionPanel(actionId) {
  try {
    const action = await getAction(actionId);
    const updates = await getActionUpdates(actionId);

    renderActionPanel(action, updates);
  } catch (err) {
    showUnexpectedError(err);
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

      <button
        class="btn btn-secondary"
        id="btn-reopen-action"
      >
        Reopen Action
      </button>
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
        showUnexpectedError(err);
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
        showUnexpectedError(err);
      }
    });

  document
    .getElementById("btn-reopen-action")
    ?.addEventListener("click", async () => {
      try {
        await reopenAction(actionId);
        await refreshIncidentPage();
        await openActionPanel(actionId);
      } catch (err) {
        showUnexpectedError(err);
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
      showUnexpectedError(err);
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
      const confirmed = await showConfirm(
        "Close Incident",
        "Are you sure you want to close this incident?",
      );

      if (!confirmed) {
        return;
      }

      try {
        await closeIncident(incidentId);

        window.location.reload();
      } catch (err) {
        showUnexpectedError(err);
      }
    });
}

function renderRolePicker(allRoles) {
  const container = document.getElementById("role-picker");

  if (!container) {
    return;
  }

  if (selectedRoles.length === 0) {
    selectedRoles = [...allRoles];
  }

  container.innerHTML = `
  <div class="role-picker">
    <div class="role-picker__header">
      <h3>Visible Roles</h3>
      <small>Select which roles appear in the matrix</small>
    </div>
    <div class="role-picker__roles">
      ${allRoles
        .map(
          (role) => `
            <label class="role-picker__item">
              <input
                type="checkbox"
                value="${role}"
                ${selectedRoles.includes(role) ? "checked" : ""}
              />
              <span class="role-picker__pill">
                ${role}
              </span>
            </label>
          `,
        )
        .join("")}
    </div>
  </div>
`;

  wireRolePicker(allRoles);
}

function wireRolePicker() {
  document
    .querySelectorAll("#role-picker input[type='checkbox']")
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const checked = [
          ...document.querySelectorAll("#role-picker input:checked"),
        ];

        if (checked.length === 0) {
          checkbox.checked = true;
          showWarning("At least one role must remain visible.");
          return;
        }

        selectedRoles = checked.map((input) => input.value);
        currentPreferences = {
          ...currentPreferences,
          incidentMatrix: {
            ...(currentPreferences.incidentMatrix || {}),
            visibleRoles: selectedRoles,
          },
        };

        queuePreferenceSave();
        renderActions(currentActions);
      });
    });
}

// -----------------------------------------------------------------------------
// Preferences
// -----------------------------------------------------------------------------

function queuePreferenceSave() {
  clearTimeout(saveTimeout);

  saveTimeout = setTimeout(() => {
    saveLayoutPreferences();
  }, 500);
}

// -----------------------------------------------------------------------------
// Incident Timer
// -----------------------------------------------------------------------------

function startIncidentTimer(startedAt) {
  clearInterval(incidentTimerInterval);
  clearTimeout(incidentTimerTimeout);

  const element = document.getElementById("incident-duration");

  if (!element || !startedAt) {
    return;
  }

  const update = () => {
    const started = parseUkDateTime(startedAt);
    const diffMs = Date.now() - started.getTime();
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      element.textContent = `🕒 Open ${days}d ${hours}h`;
    } else if (hours > 0) {
      element.textContent = `🕒 Open ${hours}h ${minutes}m`;
    } else {
      element.textContent = `🕒 Open ${minutes}m`;
    }

    if (currentActions.length) {
      renderActions(currentActions);
    }

    if (currentSummary) {
      renderSummary(currentSummary);
    }
  };

  update();

  const msUntilNextMinute = 60000 - (Date.now() % 60000);

  incidentTimerTimeout = setTimeout(() => {
    update();
    incidentTimerInterval = setInterval(update, 60000);
  }, msUntilNextMinute);
}

async function saveLayoutPreferences() {
  try {
    await savePreferences({
      incidentMatrix: {
        visibleRoles: selectedRoles,
      },
    });

    currentPreferences = {
      ...currentPreferences,
      incidentMatrix: {
        ...(currentPreferences.incidentMatrix || {}),
        visibleRoles: selectedRoles,
      },
    };
  } catch (err) {
    showError(err?.message || "Failed to save preferences.");
  }
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function showUnexpectedError(err) {
  console.error(err);

  showError(err?.message || "An unexpected error occurred.");
}

function parseUkDateTime(value) {
  const [datePart, timePart] = value.split(", ");
  const [day, month, year] = datePart.split("/");
  return new Date(`${year}-${month}-${day}T${timePart}`);
}

function isActionOverdue(action) {
  if (!incidentStartedAt) {
    return false;
  }

  if (action.status === "completed") {
    return false;
  }

  const incidentStart = parseUtcDate(incidentStartedAt);

  const dueDate = new Date(
    incidentStart.getTime() + action.due_from_incident_start * 60 * 1000,
  );

  return Date.now() > dueDate.getTime();
}

function getOverdueActionCount(actions) {
  return actions.filter((action) => isActionOverdue(action)).length;
}

// -----------------------------------------------------------------------------
// Matrix Helpers
// -----------------------------------------------------------------------------

function getAllRoles(actions) {
  return [
    ...new Set(
      actions.flatMap((action) => action.roles.map((role) => role.name)),
    ),
  ];
}

function getVisibleRoles(allRoles) {
  if (!selectedRoles.length) {
    return allRoles;
  }
  return allRoles.filter((role) => selectedRoles.includes(role));
}

function getStages(actions) {
  return [...new Set(actions.map((action) => action.stage_number))].sort(
    (a, b) => a - b,
  );
}

function buildActionCard(action) {
  const roleNames = action.roles.map((role) => role.name).join(", ");

  const dueLabel =
    action.due_from_stage_start != null
      ? `${action.due_from_stage_start} mins from stage start`
      : `${action.due_from_incident_start} mins from incident start`;

  const overdueBadge = isActionOverdue(action)
    ? `
      <span class="matrix-action__overdue">
        ⚠ Overdue
      </span>
    `
    : "";

  const actionButton =
    action.status === "pending"
      ? `
          <div class="matrix-action__buttons">
            <button
              class="btn btn-secondary btn-start-action-card"
              data-action-id="${action.id}"
            >
              Start
            </button>
          </div>
        `
      : action.status === "in_progress"
        ? `
            <div class="matrix-action__buttons">
              <button
                class="btn btn-secondary btn-complete-action-card"
                data-action-id="${action.id}"
              >
                Complete
              </button>
            </div>
          `
        : "";

  return `
    <div
      class="matrix-action matrix-action--${action.status}"
      data-action-id="${action.id}"
    >
      <div class="matrix-action__title">
        ${action.title}
      </div>

      <div class="matrix-action__meta">
        <span class="matrix-action__status">
          ${action.status}
        </span>
        
        <span class="matrix-action__due">
          ${dueLabel}
        </span>
      </div>

      <div class="matrix-action__roles">
        ${roleNames}
      </div>

      <div style="display: flex; justify-content: space-between">${actionButton}${overdueBadge}</div>
    </div>
  `;
}

function buildStageRow(stageNumber, actions, roles) {
  const stageInfo = actions.find(
    (action) => action.stage_number === stageNumber,
  );

  let html = `
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

    html += "<td>";
    matchingActions.forEach((action) => {
      html += buildActionCard(action);
    });
    html += "</td>";
  });
  html += "</tr>";

  return html;
}

function buildMatrixTable(actions, roles, stages) {
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
    html += buildStageRow(stageNumber, actions, roles);
  });

  html += `
    </tbody>
  `;

  return html;
}

// -----------------------------------------------------------------------------
// Live Updates
// -----------------------------------------------------------------------------

function registerLiveUpdateListeners() {
  if (sseListenersRegistered) return;

  window.addEventListener("incident-action-updated", handleIncidentUpdate);

  window.addEventListener("incident-action-assigned", handleIncidentUpdate);

  window.addEventListener("incident-closed", handleIncidentClosed);

  sseListenersRegistered = true;
}

async function handleIncidentUpdate(event) {
  const currentIncidentId = Number(window.location.pathname.split("/").pop());

  if (event.detail.incidentId !== currentIncidentId) {
    return;
  }

  await refreshIncidentPage();
}

async function handleIncidentClosed(event) {
  const currentIncidentId = Number(window.location.pathname.split("/").pop());

  if (event.detail.incidentId !== currentIncidentId) {
    return;
  }

  if (event.detail.userId !== currentUser.id) {
    showConfirm("This incident was closed by another user.");
  }

  await refreshIncidentPage();
}
