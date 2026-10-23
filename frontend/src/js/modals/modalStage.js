import { createStage, updateStage } from "../services/planStageService.js";
import { resetFormInputs } from "../components/modal.js";
import { showSuccess, showError } from "../utils/myAlert.js";
import { refreshPlanTemplatePage } from "../pages/planTemplate.js";
import { showConfirm } from "./modalConfirm.js";
import { getPlan } from "../services/planService.js";

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
        const plan = await getPlan(data.plan_template_id);
        const currentStage = plan.stages.find(
          (stage) => stage.id === Number(stageId),
        );
        const stages = plan.stages
          .map((stage) =>
            stage.id === Number(stageId)
              ? {
                  ...stage,
                  stage_number: data.stage_number,
                  due_from_incident_start: data.due_from_incident_start,
                }
              : stage,
          )
          .sort((a, b) => a.stage_number - b.stage_number);
        const boundaryActions = plan.stages.flatMap((stage) =>
          stage.actions.filter(
            (action) =>
              Number(action.due_from_incident_start) ===
              Number(currentStage.due_from_incident_start),
          ),
        );
        let adjustActionDueTimes = false;

        if (
          boundaryActions.length > 0 &&
          data.due_from_incident_start !==
            Number(currentStage.due_from_incident_start)
        ) {
          adjustActionDueTimes = await showConfirm(
            "Adjust Boundary Actions",
            `${boundaryActions.length} action${boundaryActions.length === 1 ? " is" : "s are"} due at this stage's current deadline. Move ${boundaryActions.length === 1 ? "it" : "them"} to the new deadline?`,
          );
        }

        await updateStage(stageId, {
          stage_number: data.stage_number,
          name: data.name,
          due_from_incident_start: data.due_from_incident_start,
          adjust_action_due_times: adjustActionDueTimes,
        });

        showSuccess("Stage updated successfully");
      } else {
        await createStage(data);

        showSuccess("Stage created successfully");
      }

      resetFormInputs(form);

      document.getElementById("modal-form-stage--id").value = "";

      modal.classList.add("hidden");

      await refreshPlanTemplatePage();
    } catch (err) {
      console.error(err);

      showError(err.message || "Failed to save stage");
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
