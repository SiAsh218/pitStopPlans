import {
  getTemplate,
  updateTemplate,
  approveTemplate,
  retireTemplate,
  reinstateTemplate,
  deleteDraftTemplate,
  getTemplateHistory,
} from "../services/planTemplateService.js";
import { getPlan } from "../services/planService.js";
import {
  updateStage,
  createStage,
  deleteStage,
  reorderStages,
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
  reorderActions,
} from "../services/planStageActionService.js";
import { getCurrentUser } from "../auth.js";

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

    const isDraft = template.status === "draft";

    renderTemplateMeta(template, isDraft);

    const roles = await renderRoles(isDraft);

    renderVersionHistory(history, template.id);

    renderTemplateMatrix(plan, isDraft, template, roles);

    if (isDraft) {
      wireAddStageButton(plan);

      wireEditIncidentTypeButton(template);
      wireApproveTemplateButton(template.id);
      wireDeleteDraftButton(template.id);
    }

    if (template.status === "approved") {
      wireRetireTemplateButton(template.id);
    }

    if (template.status === "retired") {
      wireReinstateTemplateButton(template.id);
    }
  } catch (err) {
    console.error(err);
  }
}

export async function refreshPlanTemplatePage() {
  await initPlanTemplatePage();
}

function renderTemplateMeta(template, isDraft) {
  const container = document.querySelector(".template-meta");

  if (!container) {
    return;
  }

  const isApproved = template.status === "approved";
  const isRetired = template.status === "retired";

  const user = getCurrentUser();

  container.innerHTML = `
    <div class="card template-page__hero">
      <div class="template-page__hero-main">
        <div>
          <p class="template-page__eyebrow">Template overview</p>
          <h1>${template.incident_type.name}</h1>
          ${
            template.incident_type.description
              ? `<p>${template.incident_type.description}</p>`
              : ""
          }
          ${
            template.proposed_incident_type
              ? `<p class="template-page__pending-change">Pending approval — Template name: ${template.proposed_incident_type.name}; Template description: ${template.proposed_incident_type.description || "None"}</p>`
              : ""
          }
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
          isDraft && user.role !== "user"
            ? `
              <button id="btn-add-stage" class="btn btn-primary">
                Add Stage
              </button>

              <button
                id="btn-edit-incident-type"
                class="btn btn-secondary"
                type="button"
              >
                Edit Incident Type
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
          isApproved && user?.role === "admin"
            ? `
              <button id="btn-retire-template" class="btn btn-danger">
                Retire Template
              </button>
            `
            : ""
        }
        ${
          isRetired && user?.role === "admin"
            ? `
              <button id="btn-reinstate-template" class="btn btn-primary">
                Reinstate Template
              </button>
            `
            : ""
        }
      </div>
    </div>
  `;
}

function wireEditIncidentTypeButton(template) {
  const button = document.getElementById("btn-edit-incident-type");
  const modal = document.getElementById("modal-form-template-incident-type");
  const form = document.getElementById("form-template-incident-type");

  if (!button || !modal || !form) {
    return;
  }

  button.addEventListener("click", () => {
    const proposed = template.proposed_incident_type;
    document.getElementById("modal-template-incident-type-name").value =
      proposed?.name || template.incident_type.name;
    document.getElementById(
      "modal-template-incident-type-description",
    ).value =
      proposed?.description ?? template.incident_type.description ?? "";
    modal.classList.remove("hidden");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document
      .getElementById("modal-template-incident-type-name")
      .value.trim();
    const description = document
      .getElementById("modal-template-incident-type-description")
      .value.trim();

    if (!name) {
      showError("Please enter an incident type name.");
      return;
    }

    try {
      await updateTemplate(template.id, {
        proposed_incident_type: {
          name,
          description,
        },
      });
      modal.classList.add("hidden");
      showSuccess("Incident type changes saved for approval.");
      await refreshPlanTemplatePage();
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to update incident type.");
    }
  });
}

function getNextActionNumber(actions = []) {
  const highest = actions.reduce((max, action) => {
    const value = Number(action.action_number || 0);
    return value > max ? value : max;
  }, 0);

  return highest + 1;
}

function getStageStartTime(stage, stages) {
  const orderedStages = [...stages].sort(
    (a, b) => a.stage_number - b.stage_number,
  );
  const stageIndex = orderedStages.findIndex((item) => item.id === stage.id);

  return Number(orderedStages[stageIndex - 1]?.due_from_incident_start ?? 0);
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

function renderTemplateMatrix(plan, isDraft, template, currentRoles = []) {
  const container = document.getElementById("template-matrix");

  if (!container) {
    return;
  }

  const user = getCurrentUser();

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

  const currentRolesById = new Map(
    currentRoles.map((role) => [Number(role.id), role]),
  );
  const roleById = new Map();
  actions.forEach((action) => {
    action.roles.forEach((role) => {
      const roleId = Number(role.id);
      roleById.set(roleId, {
        ...role,
        ...currentRolesById.get(roleId),
        id: roleId,
      });
    });
  });
  const assignedRoleIds = [...roleById.keys()];
  const savedRoleIds = Array.isArray(template.role_order)
    ? template.role_order.map(Number).filter((roleId) => roleById.has(roleId))
    : [];
  const orderedRoleIds = [
    ...new Set([...savedRoleIds, ...assignedRoleIds]),
  ];
  const roles = orderedRoleIds.map((roleId) => roleById.get(roleId));

  const stages = [...plan.stages].sort(
    (a, b) => a.stage_number - b.stage_number,
  );
  const orderedStages = stages;

  const table = document.createElement("table");

  table.className = "incident-matrix template-matrix";

  let html = `
    <thead>
      <tr>
        <th>Stage</th>
  `;

  roles.forEach((role, roleIndex) => {
    html += `
      <th>
        <div class="template-matrix__role-header">
          <span>${role.name}</span>
          ${
            isDraft && user.role !== "user"
              ? `
                <div class="template-matrix__role-controls" aria-label="Reorder roles">
                  <button
                    class="btn btn-secondary btn-move-role"
                    type="button"
                    data-role-id="${role.id}"
                    data-direction="left"
                    aria-label="Move ${role.name} column left"
                    title="Move column left"
                    ${roleIndex === 0 ? "disabled" : ""}
                  >
                    &#8592;
                  </button>
                  <button
                    class="btn btn-secondary btn-move-role"
                    type="button"
                    data-role-id="${role.id}"
                    data-direction="right"
                    aria-label="Move ${role.name} column right"
                    title="Move column right"
                    ${roleIndex === roles.length - 1 ? "disabled" : ""}
                  >
                    &#8594;
                  </button>
                </div>
              `
              : ""
          }
        </div>
      </th>
    `;
  });

  html += `
      </tr>
    </thead>

    <tbody>
  `;

  stages.forEach((stage) => {
    const orderedActions = [...stage.actions].sort(
      (a, b) => a.action_number - b.action_number,
    );

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
            isDraft && user.role !== "user"
              ? `
                <div class="stage-actions">
                  <div class="stage-order-controls" aria-label="Reorder stages">
                    <button
                      class="btn btn-secondary btn-move-stage"
                      type="button"
                      data-stage-id="${stage.id}"
                      data-direction="up"
                      aria-label="Move stage ${stage.stage_number} up"
                      title="Move stage up"
                      ${orderedStages[0]?.id === stage.id ? "disabled" : ""}
                    >
                      &#8593;
                    </button>
                    <button
                      class="btn btn-secondary btn-move-stage"
                      type="button"
                      data-stage-id="${stage.id}"
                      data-direction="down"
                      aria-label="Move stage ${stage.stage_number} down"
                      title="Move stage down"
                      ${orderedStages.at(-1)?.id === stage.id ? "disabled" : ""}
                    >
                      &#8595;
                    </button>
                  </div>

                  <button
                    class="btn btn-secondary btn-add-action"
                    data-stage-id="${stage.id}"
                    data-next-action-number="${getNextActionNumber(stage.actions)}"
                    data-stage-start="${getStageStartTime(stage, stages)}"
                    data-stage-end="${stage.due_from_incident_start}"
                  >
                    + Action
                  </button>

                  <div class="stage-actions__secondary">
                    <button
                      class="btn btn-secondary btn-edit-stage"
                      data-stage-id="${stage.id}"
                      data-template-id="${plan.id}"
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

    roles.forEach((role) => {
      const matchingActions = orderedActions.filter((action) =>
        action.roles.some((actionRole) => Number(actionRole.id) === role.id),
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
            isDraft && user.role !== "user"
              ? `
                <div class="matrix-action__buttons">
                  ${
                    Number(action.roles[0]?.id) === role.id
                      ? `
                        <button
                          class="btn btn-secondary btn-move-action"
                          type="button"
                          data-action-id="${action.id}"
                          data-role-id="${action.roles[0].id}"
                          data-direction="up"
                          aria-label="Move action ${action.action_number} up"
                          title="Move action up"
                          ${matchingActions[0]?.id === action.id ? "disabled" : ""}
                        >
                          &#8593;
                        </button>

                        <button
                          class="btn btn-secondary btn-move-action"
                          type="button"
                          data-action-id="${action.id}"
                          data-role-id="${action.roles[0].id}"
                          data-direction="down"
                          aria-label="Move action ${action.action_number} down"
                          title="Move action down"
                          ${matchingActions.at(-1)?.id === action.id ? "disabled" : ""}
                        >
                          &#8595;
                        </button>
                      `
                      : ""
                  }

                  <button
                    class="btn btn-secondary btn-edit-action"

                    data-action-id="${action.id}"
                    data-action-number="${action.action_number}"
                    data-title="${action.title}"
                    data-description="${action.description}"
                    data-stage-id="${action.plan_stage_id}"
                    data-due-stage="${action.due_from_stage_start}"
                    data-due-incident="${action.due_from_incident_start}"
                    data-stage-start="${getStageStartTime(stage, stages)}"
                    data-stage-end="${stage.due_from_incident_start}"
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
    wireStageOrderButtons(plan);
    wireActionOrderButtons(plan);
    wireRoleOrderButtons(plan.id, roles);

    wireEditActionButtons();
    wireDeleteActionButtons();
  }
  wireViewActionCards();
}

function wireRoleOrderButtons(templateId, roles) {
  document.querySelectorAll(".btn-move-role").forEach((button) => {
    button.addEventListener("click", async () => {
      const currentIndex = roles.findIndex(
        (role) => role.id === Number(button.dataset.roleId),
      );
      const targetIndex =
        currentIndex + (button.dataset.direction === "left" ? -1 : 1);

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= roles.length) {
        return;
      }

      const reorderedRoles = [...roles];
      [reorderedRoles[currentIndex], reorderedRoles[targetIndex]] = [
        reorderedRoles[targetIndex],
        reorderedRoles[currentIndex],
      ];

      try {
        await updateTemplate(templateId, {
          role_order: reorderedRoles.map((role) => role.id),
        });
        await refreshPlanTemplatePage();
      } catch (err) {
        console.error(err);
        showError(err.message || "Failed to reorder roles");
      }
    });
  });
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
      configureActionDueInputs(
        button.dataset.stageStart,
        button.dataset.stageEnd,
      );
      document.getElementById("modal-action-title").textContent = "Edit Action";
      document.getElementById("modal-action-submit").textContent =
        "Update Action";

      document.getElementById("modal-action-number").disabled = false;
      document.getElementById("modal-action-title-input").disabled = false;
      document.getElementById("modal-action-description").disabled = false;
      document.getElementById("modal-action-stage-due").disabled = false;

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
        event.target.closest(".btn-delete-action") ||
        event.target.closest(".btn-move-action")
      ) {
        return;
      }

      const actionId = card.dataset.actionId;

      openTemplateActionModal(actionId);
    });
  });
}

function wireStageOrderButtons(plan) {
  const templateId = plan.id;

  document.querySelectorAll(".btn-move-stage").forEach((button) => {
    button.addEventListener("click", async () => {
      const stages = [...plan.stages].sort(
        (a, b) => a.stage_number - b.stage_number,
      );
      const stageIndex = stages.findIndex(
        (stage) => stage.id === Number(button.dataset.stageId),
      );
      const targetIndex =
        stageIndex + (button.dataset.direction === "up" ? -1 : 1);

      if (targetIndex < 0 || targetIndex >= stages.length) {
        return;
      }

      [stages[stageIndex], stages[targetIndex]] = [
        stages[targetIndex],
        stages[stageIndex],
      ];

      try {
        await reorderStages(
          templateId,
          stages.map((stage) => stage.id),
        );
        await refreshPlanTemplatePage();
      } catch (err) {
        console.error(err);
        showError(err.message || "Failed to reorder stages");
      }
    });
  });
}

function wireActionOrderButtons(plan) {
  document.querySelectorAll(".btn-move-action").forEach((button) => {
    button.addEventListener("click", async () => {
      const actionId = Number(button.dataset.actionId);
      const stage = plan.stages.find((item) =>
        item.actions.some((action) => action.id === actionId),
      );

      if (!stage) {
        return;
      }

      const actions = [...stage.actions].sort(
        (a, b) => a.action_number - b.action_number,
      );
      const roleId = Number(button.dataset.roleId);
      const roleActions = actions.filter((action) =>
        action.roles.some((role) => role.id === roleId),
      );
      const roleActionIndex = roleActions.findIndex(
        (action) => action.id === actionId,
      );
      const targetIndex =
        roleActionIndex + (button.dataset.direction === "up" ? -1 : 1);

      if (targetIndex < 0 || targetIndex >= roleActions.length) {
        return;
      }

      [roleActions[roleActionIndex], roleActions[targetIndex]] = [
        roleActions[targetIndex],
        roleActions[roleActionIndex],
      ];
      let roleActionIndexInOrder = 0;
      const reorderedActions = actions.map((action) =>
        action.roles.some((role) => role.id === roleId)
          ? roleActions[roleActionIndexInOrder++]
          : action,
      );

      try {
        await reorderActions(
          stage.id,
          reorderedActions.map((action) => action.id),
        );
        await refreshPlanTemplatePage();
      } catch (err) {
        console.error(err);
        showError(err.message || "Failed to reorder actions");
      }
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

        await refreshPlanTemplatePage();
      } catch (err) {
        showError(err.message || "Failed to delete action");
      }
    });
  });
}

function wireStageButtons() {
  document.querySelectorAll(".btn-edit-stage").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById("modal-form-stage--template-id").value =
        button.dataset.templateId;
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

        await refreshPlanTemplatePage();
      } catch (err) {
        console.error(err);

        showError(err.message || "Failed to delete stage");
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

      showError(err.message || "Failed to approve template");
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

      showError(err.message || "Failed to remove draft");
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

      showError(err.message || "Failed to retire template");
    }
  });
}

function wireReinstateTemplateButton(templateId) {
  const button = document.getElementById("btn-reinstate-template");

  button?.addEventListener("click", async () => {
    const confirmed = await showConfirm(
      "Reinstate Template",
      "Are you sure you want to reinstate this template?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await reinstateTemplate(templateId);
      showSuccess("Template reinstated successfully");
      location.reload();
    } catch (err) {
      console.error(err);
      showError(err.message || "Failed to reinstate template");
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
    return [];
  }

  const response = await getRoles();

  const roles = response.data;

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

  return roles;
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
  const response = await getRoles();

  const roles = response.data;
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
    <label class="action-role-option">

      <input
        type="checkbox"
        class="action-role-checkbox"
        value="${role.id}"
        ${selectedIds.has(role.id) ? "checked" : ""}
      >

      <span class="action-role-option__label">
        ${role.name}${disabledLabel}
      </span>

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
      document.getElementById("modal-action-stage-due").value = String(
        Math.max(
          0,
          Number(button.dataset.stageEnd) - Number(button.dataset.stageStart),
        ),
      );
      configureActionDueInputs(
        button.dataset.stageStart,
        button.dataset.stageEnd,
      );
      document.getElementById("modal-action-title").textContent = "Add Action";
      document.getElementById("modal-action-submit").textContent =
        "Create Action";

      document.getElementById("modal-form-action").classList.remove("hidden");
    });
  });
}

function configureActionDueInputs(stageStart, stageEnd) {
  const stageDueInput = document.getElementById("modal-action-stage-due");
  const incidentDueInput = document.getElementById("modal-action-incident-due");
  const start = Number(stageStart);
  const end = Number(stageEnd);

  stageDueInput.min = "0";
  stageDueInput.max = String(Math.max(0, end - start));
  stageDueInput.oninput = () => {
    const offset = Number(stageDueInput.value);
    incidentDueInput.value = stageDueInput.value ? String(start + offset) : "";
  };
  stageDueInput.oninput();
}
