import { getTemplate } from "../services/planTemplateService.js";
import { getPlan } from "../services/planService.js";
import {
  updateStage,
  createStage,
  deleteStage,
} from "../services/planStageService.js";
import { showConfirm } from "../modals/modalConfirm.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";
import {
  getRolesFromDB,
  createRole,
  updateRole,
  deleteRole,
} from "../services/roleService.js";

export async function initPlanTemplatePage() {
  const container = document.querySelector(".template-meta");

  if (!container) {
    return;
  }

  try {
    const templateId = window.location.pathname.split("/").pop();

    const template = await getTemplate(templateId);

    const plan = await getPlan(templateId);

    const isDraft = template.status === "draft";

    renderTemplateMeta(template, isDraft);

    await renderRoles(isDraft);

    renderTemplateMatrix(plan, isDraft);

    if (isDraft) {
      wireAddStageButton(plan);
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

  container.innerHTML = `
    <div class="card">

      <h1>
        ${template.title}
      </h1>

      <p>
        <strong>Status:</strong>
        ${template.status}
      </p>

      <p>
        <strong>Version:</strong>
        ${template.version}
      </p>

      ${
        isDraft
          ? `
            <div class="card-actions">
              <button
                id="btn-add-stage"
                class="btn btn-primary"
              >
                Add Stage
              </button>
            </div>
          `
          : ""
      }

    </div>
  `;
}

function renderTemplateMatrix(plan, isDraft) {
  const container = document.getElementById("template-matrix");

  if (!container) {
    return;
  }

  container.innerHTML = "";

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

  table.className = "incident-matrix";

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
                    data-next-action-number="${stage.actions.length + 1}"
                  >
                    Add Action
                  </button>

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
          <div class="matrix-action">

            <div class="matrix-action__title">
              ${action.title}
            </div>

            <div class="matrix-action__status">
              Due:
              ${action.due_from_incident_start}
              mins
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

  if (isDraft) {
    wireStageButtons();
    wireActionButtons();
  }
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

    document.getElementById("modal-form-incident--stage-number").value = "";

    document.getElementById("modal-form-incident--stage-name").value = "";

    document.getElementById(
      "modal-form-incident--mins-from-incident-start",
    ).value = "";

    document
      .getElementById("modal-form-incident-stage")
      .classList.remove("hidden");
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

async function renderRoles(isDraft) {
  const container = document.getElementById("template-roles");

  if (!container) {
    return;
  }

  const roles = await getRolesFromDB();

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

async function renderActionRoleCheckboxes() {
  const roles = await getRolesFromDB();

  const container = document.getElementById("modal-action-roles");

  container.innerHTML = "";

  roles.forEach((role) => {
    container.insertAdjacentHTML(
      "beforeend",
      `
        <label>

          <input
            type="checkbox"
            class="action-role-checkbox"
            value="${role.id}"
          >

          ${role.name}

        </label>
      `,
    );
  });
}

function wireActionButtons() {
  document.querySelectorAll(".btn-add-action").forEach((button) => {
    button.addEventListener("click", async () => {
      await renderActionRoleCheckboxes();

      document.getElementById("modal-action-stage-id").value =
        button.dataset.stageId;
      document.getElementById("modal-action-number").value =
        button.dataset.nextActionNumber;

      document.getElementById("modal-form-action").classList.remove("hidden");
    });
  });
}
