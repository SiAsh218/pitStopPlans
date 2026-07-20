import { incidentState, clearIncidentState } from "../state/incidentState.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";
import {
  renderRoleOptions,
  renderStageOptions,
} from "../modals/modalAction.js";

document.addEventListener("DOMContentLoaded", () => {
  clearIncidentState();
});

export function initPlanTemplatePage() {
  const grid = document.querySelector(".plan-builder__grid");
  if (!grid) return;

  const btnAddStage = document.getElementById("btn--add-stage");
  const btnAddRole = document.getElementById("btn--add-role");
  const btnAddAction = document.getElementById("btn--add-action");

  renderPlan(incidentData);

  btnAddStage?.addEventListener("click", () => {
    if (getRoles().length < 1) {
      showWarning("Roles need adding before Stages");
      return;
    }

    const modal = document.getElementById("modal-form-incident-stage");
    modal.classList.remove("hidden");
  });

  btnAddRole?.addEventListener("click", () => {
    const modal = document.getElementById("modal-form-incident-role");
    modal.classList.remove("hidden");
  });

  btnAddAction?.addEventListener("click", () => {
    if (getRoles().length < 1) {
      showWarning("Roles and Stages need adding before Actions");
      return;
    }

    if (getStages().length < 1) {
      showWarning("Roles and Stages need adding before Actions");
      return;
    }

    renderRoleOptions(getRoles());
    renderStageOptions(getStages());

    const modal = document.getElementById("modal-form-incident-action");
    modal.classList.remove("hidden");
  });
}

function getUniqueRoles(plan) {
  const rolesMap = new Map();

  plan.stages.forEach((stage) => {
    if (stage.actions && stage.actions.length > 0) {
      stage.actions.forEach((action) => {
        action.roles.forEach((role) => {
          rolesMap.set(role.id, role);
        });
      });
    }
  });

  return Array.from(rolesMap.values());
}

export function renderPlan(plan) {
  const grid = document.querySelector(".plan-builder__grid");
  if (!grid) return;

  // const roles = getUniqueRoles(plan);
  renderRoles(grid, plan.incidentRoles);

  const stages = plan.stages;
  renderStages(grid, stages, plan.incidentRoles);
}

function renderStages(grid, stages, roles) {
  stages.forEach((stage) => {
    grid.insertAdjacentHTML(
      "beforeend",
      `<div class="plan-builder__stage">
        <span>${stage.stageName}</span>
        <span style="font-weight: normal; margin-top: 10px">${stage.minsFromIncStart} minutes</span>
      </div>`,
    );

    roles.forEach((role) => {
      if (!stage.actions || stage.actions.length === 0) {
        grid.insertAdjacentHTML(
          "beforeend",
          `
      <div class="plan-builder__cell"> </div>`,
        );
        return;
      }

      const actions = stage.actions.filter((action) =>
        action.roles.some((r) => r.id == role.id),
      );

      grid.insertAdjacentHTML(
        "beforeend",
        `
      <div class="plan-builder__cell">
        ${actions
          .map(
            (action) => `
          <div class="action-card">
            <span class="action-card--title">${action.title}</span>
            <span class="action-card--description">${action.description}</span>
          </div>
        `,
          )
          .join("")}
        
      </div>
      `,
      );
    });
  });
}

function renderRoles(grid, roles) {
  grid.style.gridTemplateColumns = `220px repeat(${roles.length}, minmax(220px, 1fr))`;
  grid.innerHTML = `<div class='plan-builder__corner'>Stage</div>${roles
    .map((role) => {
      return `<div class="plan-builder__role">${role.name}</div>`;
    })
    .join("")}`;
}
