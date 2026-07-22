import { createStage, updateStage } from "../services/planStageService.js";
import { resetFormInputs } from "../components/modal.js";
import { showSuccess, showError } from "../utils/myAlert.js";

export function initModalStage() {
  const modal = document.getElementById("modal-form-incident-stage");

  if (!modal) return;

  const form = modal.querySelector("form");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const data = getData();

      const stageId = document.getElementById("modal-form-stage--id").value;

      if (stageId) {
        await updateStage(stageId, {
          stage_number: data.stage_number,
          name: data.name,
          due_from_incident_start: data.due_from_incident_start,
        });

        showSuccess("Stage updated successfully");
      } else {
        await createStage(data);

        showSuccess("Stage created successfully");
      }

      resetFormInputs(form);

      document.getElementById("modal-form-stage--id").value = "";

      location.reload();
    } catch (err) {
      console.error(err);

      showError("Failed to save stage");
    }
  });
}

function getData() {
  return {
    plan_template_id: Number(
      document.getElementById("modal-form-stage--template-id").value,
    ),

    stage_number: Number(
      document.getElementById("modal-form-incident--stage-number").value,
    ),

    name: document
      .getElementById("modal-form-incident--stage-name")
      .value.trim(),

    due_from_incident_start: Number(
      document.getElementById("modal-form-incident--mins-from-incident-start")
        .value,
    ),
  };
}
