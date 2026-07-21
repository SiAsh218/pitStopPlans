import { initModalStage } from "../modals/modalStage.js";
import { initModalRole } from "../modals/modalRole.js";
import { initModalAction } from "../modals/modalAction.js";
import { initModalIncident } from "../modals/modalIncident.js";
import { incidentState } from "../state/incidentState.js";
// import { renderPlan } from "../pages/planTemplate.js";

export function initModal() {
  initModalStage();
  initModalRole();
  initModalAction();
  initModalIncident();

  const modals = document.querySelectorAll(".modal-form");
  const overlays = document.querySelectorAll(".modal-form__overlay");
  const closeBtns = document.querySelectorAll(".modal-form__close");

  overlays.forEach((overlay) => {
    overlay.addEventListener("click", () => {
      closeAllModals(modals);
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeAllModals(modals);
    });
  });
}

export function resetFormInputs(form) {
  form.querySelectorAll("input").forEach((input) => (input.value = ""));
}

export function renderFullPlan() {
  renderPlan(incidentState);
}

function closeAllModals(modals) {
  modals.forEach((modal) => modal.classList.add("hidden"));
}
