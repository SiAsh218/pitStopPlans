import {
  getTemplate,
  approveTemplate,
  retireTemplate,
  deleteDraftTemplate,
  getTemplateHistory,
} from "../services/planTemplateService.js";
import { getPlan } from "../services/planService.js";
import {
  updateStage,
  createStage,
  deleteStage,
} from "../services/planStageService.js";
import { showConfirm } from "../modals/modalConfirm.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../services/roleService.js";
import {
  createAction,
  updateAction,
  deleteAction,
} from "../services/planStageActionService.js";

export async function initPlanTemplatePage() {
  const container = document.querySelector(".template-meta");

  if (!container) {
    return;
  }

  try {
    const templateId = window.location.pathname.split("/").pop();

    const template = await getTemplate(templateId);

    const plan = await getPlan(templateId);

    const history = await getTemplateHistory(templateId);

    console.log("History:", history);

    const isDraft = template.status === "draft";

    renderTemplateMeta(template, isDraft);

    renderVersionHistory(history, template.id);

    await renderRoles(isDraft);

    renderTemplateMatrix(plan, isDraft);

    if (isDraft) {
      wireAddStageButton(plan);

      wireApproveTemplateButton(template.id);
      wireDeleteDraftButton(template.id);
    }

    if (template.status === "approved") {
      wireRetireTemplateButton(template.id);
    }
  } catch (err) {
    console.error(err);
  }
}

function renderTemplateMeta(template, isDraft) {
  const container = document.querySelector(".template-meta");

  if (!container) {
    return;
  }

  const isApproved = template.status === "approved";

  container.innerHTML = `
    <div class="card template-page__hero">
      <div class="template-page__hero-main">
        <div>
          <p class="template-page__eyebrow">Template overview</p>
          <h1>${template.title}</h1>
        </div>

        <div class="template-page__badges">
          <span class="template-page__badge template-page__badge--${template.status}">
            ${template.status}
          </span>
          <span class="template-page__badge">
            Version ${template.version}
          </span>
        </div>
      </div>

      <div class="template-page__hero-actions">
        ${
          isDraft
            ? `
              <button id="btn-add-stage" class="btn btn-primary">
                Add Stage
              </button>

              <button id="btn-approve-template" class="btn btn-primary">
                Approve Template
              </button>

              <button id="btn-delete-draft" class="btn btn-secondary btn-danger">
                Discard Draft
              </button>
            `
            : ""
        }

        ${
          isApproved
            ? `
              <button id="btn-retire-template" class="btn btn-danger">
                Retire Template
              </button>
            `
            : ""
        }
      </div>
    </div>
  `;
}

function getNextActionNumber(actions = []) {
  const highest = actions.reduce((max, action) => {
    const value = Number(action.action_number || 0);
    return value > max ? value : max;
  }, 0);

  return highest + 1;
}

function getNextStageDue(stageDueFromIncidentStart) {
  return Number(stageDueFromIncidentStart || 0);
}

function getNextIncidentDue(stageDueFromIncidentStart) {
  return Number(stageDueFromIncidentStart || 0);
}

function getNextStageNumber(stages = []) {
  const highest = stages.reduce((max, stage) => {
    const value = Number(stage.stage_number || 0);
    return value > max ? value : max;
  }, 0);

  return highest + 1;
}

function getNextStageTime(stages = []) {
  if (!stages.length) {
    return 0;
  }

  const sorted = [...stages].sort(
    (a, b) =>
      Number(a.due_from_incident_start || 0) -
      Number(b.due_from_incident_start || 0),
  );

  const lastTime = Number(
    sorted[sorted.length - 1]?.due_from_incident_start || 0,
  );

  return lastTime + 5;
}

function renderTemplateMatrix(plan, isDraft) {
  const container = document.getElementById("template-matrix");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="card template-page__section-card">
      <div class="template-page__section-header">
        <div>
          <h2>Template Matrix</h2>
          <p>Stages and actions that make up this plan template.</p>
        </div>
      </div>
    </div>
  `;

  const sectionCard = container.querySelector(".template-page__section-card");

  const actions = plan.stages.flatMap((stage) =>
    stage.actions.map((action) => ({
      ...action,
      stage_number: stage.stage_number,
    })),
  );

  const roles = [
    ...new Set(
      actions.flatMap((action) => action.roles.map((role) => role.name)),
    ),
  ];

  const stages = [...plan.stages].sort(
    (a, b) => a.stage_number - b.stage_number,
  );

  const table = document.createElement("table");

  table.className = "incident-matrix template-matrix";

  let html = `
    <thead>
      <tr>
        <th>Stage</th>
  `;

  roles.forEach((role) => {
    html += `
      <th>${role}</th>
    `;
  });

  html += `
      </tr>
    </thead>

    <tbody>
  `;

  stages.forEach((stage) => {
    html += `
      <tr>

        <td class="stage-label">

          <strong>
            Stage ${stage.stage_number}
          </strong>

          <br>

          <small>
            ${stage.name}
          </small>
          <br>
          <small>
          Due ${stage.due_from_incident_start} mins
          </small>

          ${
            isDraft
              ? `
                <div class="stage-actions">
                  <button
                    class="btn btn-secondary btn-add-action"
                    data-stage-id="${stage.id}"
                    data-next-action-number="${getNextActionNumber(stage.actions)}"
                    data-next-stage-due="${getNextStageDue(stage.due_from_incident_start)}"
                    data-next-incident-due="${getNextIncidentDue(
                      stage.due_from_incident_start,
                    )}"
                  >
                    + Action
                  </button>

                  <div class="stage-actions__secondary">
                    <button
                      class="btn btn-secondary btn-edit-stage"
                      data-stage-id="${stage.id}"
                      data-stage-number="${stage.stage_number}"
                      data-stage-name="${stage.name}"
                      data-stage-due="${stage.due_from_incident_start}"
                    >
                      Edit
                    </button>

                    <button
                      class="btn btn-danger btn-delete-stage"
                      data-stage-id="${stage.id}"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              `
              : ""
          }

        </td>
    `;

    roles.forEach((roleName) => {
      const matchingActions = stage.actions.filter((action) =>
        action.roles.some((role) => role.name === roleName),
      );

      html += `
        <td>
      `;

      matchingActions.forEach((action) => {
        html += `
          <div
            class="matrix-action"
            data-action-id="${action.id}"
          >

          <div class="matrix-action__title">
            ${action.title}
          </div>

          <div class="matrix-action__status">
            Due:
            ${action.due_from_incident_start}
            mins
          </div>

          ${
            isDraft
              ? `
                <div class="matrix-action__buttons">

                  <button
                    class="btn btn-secondary btn-edit-action"

                    data-action-id="${action.id}"
                    data-action-number="${action.action_number}"
                    data-title="${action.title}"
                    data-description="${action.description}"
                    data-stage-id="${action.plan_stage_id}"
                    data-due-stage="${action.due_from_stage_start}"
                    data-due-incident="${action.due_from_incident_start}"
                    data-role-ids='${JSON.stringify(
                      action.roles.map((role) => role.id),
                    )}'
                  >
                    Edit
                  </button>

                  <button
                    class="btn btn-danger btn-delete-action"
                    data-action-id="${action.id}"
                  >
                    Delete
                  </button>

                </div>
              `
              : ""
          }

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

  sectionCard.appendChild(table);

  if (isDraft) {
    wireStageButtons();
    wireActionButtons();

    wireEditActionButtons();
    wireDeleteActionButtons();
  }
  wireViewActionCards();
}

function wireEditActionButtons() {
  document.querySelectorAll(".btn-edit-action").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      const selectedRoleIds = JSON.parse(button.dataset.roleIds || "[]");
      const showDisabledToggle = document.getElementById(
        "show-disabled-action-roles",
      );

      if (showDisabledToggle) {
        showDisabledToggle.checked = false;
        showDisabledToggle.onchange = async () => {
          await renderActionRoleCheckboxes(
            selectedRoleIds,
            showDisabledToggle.checked,
          );
        };
      }

      await renderActionRoleCheckboxes(selectedRoleIds, false);

      document.getElementById("modal-action-number").disabled = false;
      document.getElementById("modal-action-title-input").disabled = false;
      document.getElementById("modal-action-description").disabled = false;
      document.getElementById("modal-action-stage-due").disabled = false;
      document.getElementById("modal-action-incident-due").disabled = false;

      document.getElementById("modal-action-submit").style.display = "";
      document
        .getElementById("modal-action-roles")
        .closest(".modal-form__group").style.display = "";

      document.querySelectorAll(".action-role-checkbox").forEach((checkbox) => {
        checkbox.disabled = false;
        checkbox.checked = selectedRoleIds.includes(Number(checkbox.value));
      });
      document.getElementById("modal-action-id").value =
        button.dataset.actionId;
      document.getElementById("modal-action-number").value =
        button.dataset.actionNumber;
      document.getElementById("modal-action-title-input").value =
        button.dataset.title;
      document.getElementById("modal-action-description").value =
        button.dataset.description;
      document.getElementById("modal-action-stage-id").value =
        button.dataset.stageId;
      document.getElementById("modal-action-stage-due").value =
        button.dataset.dueStage;
      document.getElementById("modal-action-incident-due").value =
        button.dataset.dueIncident;
      document.getElementById("modal-action-title").textContent = "Edit Action";
      document.getElementById("modal-action-submit").textContent =
        "Update Action";

      document.getElementById("modal-action-number").disabled = false;
      document.getElementById("modal-action-title-input").disabled = false;
      document.getElementById("modal-action-description").disabled = false;
      document.getElementById("modal-action-stage-due").disabled = false;
      document.getElementById("modal-action-incident-due").disabled = false;

      document.getElementById("modal-action-submit").style.display = "";

      document
        .getElementById("modal-action-roles")
        .closest(".modal-form__group").style.display = "";

      document.getElementById("modal-form-action").classList.remove("hidden");
    });
  });
}

function wireViewActionCards() {
  document.querySelectorAll(".matrix-action").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (
        event.target.closest(".btn-edit-action") ||
        event.target.closest(".btn-delete-action")
      ) {
        return;
      }

      const actionId = card.dataset.actionId;

      openTemplateActionModal(actionId);
    });
  });
}

async function openTemplateActionModal(actionId) {
  const templateId = window.location.pathname.split("/").pop();

  const plan = await getPlan(templateId);

  const action = plan.stages
    .flatMap((stage) => stage.actions)
    .find((action) => action.id === Number(actionId));

  if (!action) {
    return;
  }

  const modal = document.getElementById("modal-form-action");

  if (!modal) {
    return;
  }

  document.getElementById("modal-action-id").value = action.id ?? "";
  document.getElementById("modal-action-number").value =
    action.action_number ?? "";
  document.getElementById("modal-action-title-input").value =
    action.title ?? "";
  document.getElementById("modal-action-description").value =
    action.description ?? "";
  document.getElementById("modal-action-stage-due").value =
    action.due_from_stage_start ?? "";
  document.getElementById("modal-action-incident-due").value =
    action.due_from_incident_start ?? "";
  document.getElementById("modal-action-title").textContent = "View Action";

  document.getElementById("modal-action-number").disabled = true;
  document.getElementById("modal-action-title-input").disabled = true;
  document.getElementById("modal-action-description").disabled = true;
  document.getElementById("modal-action-stage-due").disabled = true;
  document.getElementById("modal-action-incident-due").disabled = true;

  document.getElementById("modal-action-submit").style.display = "none";
  document
    .getElementById("modal-action-roles")
    .closest(".modal-form__group").style.display = "none";

  modal.classList.remove("hidden");
}

function wireDeleteActionButtons() {
  document.querySelectorAll(".btn-delete-action").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.stopPropagation();
      const confirmed = await showConfirm(
        "Delete Action",
        "Are you sure you want to delete this action?",
      );

      if (!confirmed) {
        return;
      }

      try {
        await deleteAction(button.dataset.actionId);

        showSuccess("Action deleted successfully");

        location.reload();
      } catch (err) {
        showError("Failed to delete action");
      }
    });
  });
}

function wireStageButtons() {
  document.querySelectorAll(".btn-edit-stage").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById("modal-form-stage--id").value =
        button.dataset.stageId;

      document.getElementById("modal-form-incident--stage-number").value =
        button.dataset.stageNumber;

      document.getElementById("modal-form-incident--stage-name").value =
        button.dataset.stageName;

      document.getElementById(
        "modal-form-incident--mins-from-incident-start",
      ).value = button.dataset.stageDue;

      document.getElementById("modal-stage-title").textContent = "Edit Stage";

      document.getElementById("modal-form__submit--stage").textContent =
        "Update Stage";

      document
        .getElementById("modal-form-incident-stage")
        .classList.remove("hidden");
    });
  });

  document.querySelectorAll(".btn-delete-stage").forEach((button) => {
    button.addEventListener("click", async () => {
      const stageId = button.dataset.stageId;

      const confirmed = await showConfirm(
        "Delete Stage",
        "Are you sure you want to delete this stage?",
      );

      if (!confirmed) {
        return;
      }

      try {
        await deleteStage(stageId);

        showSuccess("Stage deleted successfully");

        location.reload();
      } catch (err) {
        console.error(err);

        showError("Failed to delete stage");
      }
    });
  });
}

function wireAddStageButton(plan) {
  const button = document.getElementById("btn-add-stage");

  button?.addEventListener("click", () => {
    document.getElementById("modal-stage-title").textContent = "Add Stage";

    document.getElementById("modal-form__submit--stage").textContent =
      "Create Stage";

    document.getElementById("modal-form-stage--id").value = "";

    document.getElementById("modal-form-stage--template-id").value = plan.id;

    document.getElementById("modal-form-incident--stage-number").value =
      getNextStageNumber(plan.stages);

    document.getElementById("modal-form-incident--stage-name").value = "";

    document.getElementById(
      "modal-form-incident--mins-from-incident-start",
    ).value = getNextStageTime(plan.stages);

    document
      .getElementById("modal-form-incident-stage")
      .classList.remove("hidden");
  });
}

function wireApproveTemplateButton(templateId) {
  const button = document.getElementById("btn-approve-template");

  button?.addEventListener("click", async () => {
    const confirmed = await showConfirm(
      "Approve Template",
      "Are you sure you want to approve this template? Once approved it should no longer be edited.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await approveTemplate(templateId);

      showSuccess("Template approved successfully");

      location.reload();
    } catch (err) {
      console.error(err);

      showError("Failed to approve template");
    }
  });
}

function wireDeleteDraftButton(templateId) {
  const button = document.getElementById("btn-delete-draft");

  button?.addEventListener("click", async () => {
    const confirmed = await showConfirm(
      "Discard Draft",
      "Are you sure you want to delete this draft? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteDraftTemplate(templateId);

      showSuccess("Draft removed successfully");

      if (result.redirectTemplateId) {
        window.location.href = `/templates/${result.redirectTemplateId}`;
      } else {
        window.location.href = "/templates";
      }
    } catch (err) {
      console.error(err);

      showError("Failed to remove draft");
    }
  });
}

function wireRetireTemplateButton(templateId) {
  const button = document.getElementById("btn-retire-template");

  button?.addEventListener("click", async () => {
    const confirmed = await showConfirm(
      "Retire Template",
      "Are you sure you want to retire this template?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await retireTemplate(templateId);

      showSuccess("Template retired successfully");

      location.reload();
    } catch (err) {
      console.error(err);

      showError("Failed to retire template");
    }
  });
}

export function openEditStageModal(stage) {
  document.getElementById("modal-form-stage--id").value = stage.id;

  document.getElementById("modal-form-incident--stage-number").value =
    stage.stage_number;

  document.getElementById("modal-form-incident--stage-name").value = stage.name;

  document.getElementById(
    "modal-form-incident--mins-from-incident-start",
  ).value = stage.due_from_incident_start;

  document
    .getElementById("modal-form-incident-stage")
    .classList.remove("hidden");
}

function renderVersionHistory(history, currentTemplateId) {
  const container = document.getElementById("template-history");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="card template-page__section-card">
      <div class="template-page__section-header">
        <div>
          <h2>Version History</h2>
          <p>Review earlier versions and jump to any previous release.</p>
        </div>
      </div>

      <div class="template-page__history-list">
        ${history
          .map(
            (version) => `
              <div class="template-page__history-row">
                <div>
                  <strong>v${version.version}</strong>
                  <span>${version.status}</span>
                </div>

                <div class="template-page__history-actions">
                  ${
                    version.id === currentTemplateId
                      ? '<span class="template-page__pill">Current</span>'
                      : ""
                  }

                  <button
                    class="btn btn-secondary btn-version-view"
                    data-template-id="${version.id}"
                  >
                    View
                  </button>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    </div>
  `;

  document.querySelectorAll(".btn-version-view").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = `/templates/${button.dataset.templateId}`;
    });
  });
}

async function renderRoles(isDraft) {
  const container = document.getElementById("template-roles");

  if (!container) {
    return;
  }

  const roles = await getRoles();

  let html = `
    <div class="card">

      <div class="card-actions">

        <h2>Roles</h2>

        ${
          isDraft
            ? `
              <button
                id="btn-add-role"
                class="btn btn-primary"
              >
                Add Role
              </button>
            `
            : ""
        }

      </div>
  `;

  roles.forEach((role) => {
    html += `
      <div class="role-row">

        <span>${role.name}</span>

      </div>
    `;
  });

  html += `
    </div>
  `;

  container.innerHTML = html;

  if (isDraft) {
    wireAddRoleButton();
  }
}

function wireAddRoleButton() {
  const button = document.getElementById("btn-add-role");

  button?.addEventListener("click", () => {
    document.getElementById("modal-role-title").textContent = "Add Role";

    document.getElementById("modal-role-submit").textContent = "Create Role";

    document.getElementById("modal-role-id").value = "";

    document.getElementById("modal-role-name").value = "";

    document.getElementById("modal-form-role").classList.remove("hidden");
  });
}

async function renderActionRoleCheckboxes(
  selectedRoleIds = [],
  showDisabled = false,
) {
  const roles = await getRoles();
  const selectedIds = new Set(selectedRoleIds.map(Number));

  const visibleRoles = roles.filter(
    (role) => role.active || showDisabled || selectedIds.has(role.id),
  );

  const container = document.getElementById("modal-action-roles");

  container.innerHTML = "";

  visibleRoles.forEach((role) => {
    const disabledLabel = !role.active ? " (disabled)" : "";

    container.insertAdjacentHTML(
      "beforeend",
      `
        <label>

          <input
            type="checkbox"
            class="action-role-checkbox"
            value="${role.id}"
            ${selectedIds.has(role.id) ? "checked" : ""}
          >

          ${role.name}${disabledLabel}

        </label>
      `,
    );
  });
}

function wireActionButtons() {
  document.querySelectorAll(".btn-add-action").forEach((button) => {
    button.addEventListener("click", async () => {
      const selectedRoleIds = [];
      const showDisabledToggle = document.getElementById(
        "show-disabled-action-roles",
      );

      if (showDisabledToggle) {
        showDisabledToggle.checked = false;
        showDisabledToggle.onchange = async () => {
          await renderActionRoleCheckboxes(
            selectedRoleIds,
            showDisabledToggle.checked,
          );
        };
      }

      await renderActionRoleCheckboxes(selectedRoleIds, false);

      document.getElementById("modal-action-id").value = "";
      document.getElementById("modal-action-stage-id").value =
        button.dataset.stageId;
      document.getElementById("modal-action-number").value =
        button.dataset.nextActionNumber;
      document.getElementById("modal-action-title-input").value = "";
      document.getElementById("modal-action-description").value = "";
      document.getElementById("modal-action-stage-due").value =
        button.dataset.nextStageDue;
      document.getElementById("modal-action-incident-due").value =
        button.dataset.nextIncidentDue;
      document.getElementById("modal-action-title").textContent = "Add Action";
      document.getElementById("modal-action-submit").textContent =
        "Create Action";

      document.getElementById("modal-form-action").classList.remove("hidden");
    });
  });
}
