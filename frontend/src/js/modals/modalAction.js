// import { addActionByStageName } from "../state/incidentState.js";
import { resetFormInputs, renderFullPlan } from "../components/modal.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";

export function initModalAction() {
  const modal = document.getElementById("modal-form-incident-action");

  if (!modal) return;
  const form = modal.querySelector("form");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = getData();

    addActionByStageName(data.stage, data);

    resetFormInputs(form);

    renderFullPlan();
  });
}

function getData() {
  const inputTitle = document.getElementById(
    "modal-form-incident--action-name",
  );
  const inputDescription = document.getElementById(
    "modal-form-incident--action-description",
  );
  const inputDueFromStageStart = document.getElementById(
    "modal-form-incident--due-from-stage-start",
  );
  const inputDueFromIncidentStart = document.getElementById(
    "modal-form-incident--due-from-incident-start",
  );
  const roleSelector = document.getElementById(
    "modal-form-incident--action-role",
  );
  const stageSelector = document.getElementById(
    "modal-form-incident--action-stage",
  );

  const title = inputTitle.value.trim();
  const description = inputDescription.value.trim();
  const dueFromStageStart = inputDueFromStageStart.value.trim();
  const dueFromIncidentStart = inputDueFromIncidentStart.value.trim();
  const role = {
    id: roleSelector.value,
    name: roleSelector.options[roleSelector.selectedIndex].text,
  };
  const stage = stageSelector.value;

  const data = {
    title,
    description,
    dueFromStageStart,
    dueFromIncidentStart,
    //   TODO: need a fix for multiples
    roles: [role],
    stage,
  };

  return data;
}

export function renderRoleOptions(roles) {
  const roleSelector = document.getElementById(
    "modal-form-incident--action-role",
  );

  roleSelector.innerHTML = `<option value=""></option>`;

  roles.forEach((role) => {
    roleSelector.insertAdjacentHTML(
      "beforeend",
      `<option value="${role.id}">${role.name}</option>`,
    );
  });
}

export function renderStageOptions(stages) {
  const stageSelector = document.getElementById(
    "modal-form-incident--action-stage",
  );

  stageSelector.innerHTML = `<option value=""></option>`;

  stages.forEach((stage) => {
    stageSelector.insertAdjacentHTML(
      "beforeend",
      `<option value="${stage.stageName}">${stage.stageName}</option>`,
    );
  });
}
