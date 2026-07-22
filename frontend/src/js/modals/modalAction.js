import { createAction } from "../services/planStageActionService.js";
import { showSuccess, showError } from "../utils/myAlert.js";

export function initModalAction() {
  const modal = document.getElementById("modal-form-action");

  if (!modal) {
    return;
  }

  const form = modal.querySelector("form");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const role_ids = [
        ...document.querySelectorAll(".action-role-checkbox:checked"),
      ].map((checkbox) => Number(checkbox.value));

      const payload = {
        plan_stage_id: Number(
          document.getElementById("modal-action-stage-id").value,
        ),

        action_number: Number(
          document.getElementById("modal-action-number").value,
        ),

        title: document.getElementById("modal-action-title-input").value,

        description: document.getElementById("modal-action-description").value,

        due_from_stage_start: Number(
          document.getElementById("modal-action-stage-due").value,
        ),

        due_from_incident_start: Number(
          document.getElementById("modal-action-incident-due").value,
        ),

        role_ids,
      };

      console.log(payload);

      await createAction(payload);

      showSuccess("Action created successfully");

      location.reload();
    } catch (err) {
      console.error(err);

      showError("Failed to create action");
    }
  });
}
