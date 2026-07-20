// import { addStage } from "../state/incidentState.js";
import { resetFormInputs, renderFullPlan } from "../components/modal.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";

export function initModalStage() {
  const modal = document.getElementById("modal-form-incident-stage");
  if (!modal) return;
  const form = modal.querySelector("form");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = getData();

    addStage(data);

    showSuccess("Stage created successfully");

    resetFormInputs(form);

    renderFullPlan();
  });
}

function getData() {
  const inputStageNumber = document.getElementById(
    "modal-form-incident--stage-number",
  );
  const inputStageName = document.getElementById(
    "modal-form-incident--stage-name",
  );

  const inputMinsFromIncStart = document.getElementById(
    "modal-form-incident--mins-from-incident-start",
  );

  const stageNumber = inputStageNumber.value.trim();
  const stageName = inputStageName.value.trim();
  const minsFromIncStart = inputMinsFromIncStart.value.trim();
  const actions = [];

  return { stageNumber, stageName, minsFromIncStart, actions };
}
