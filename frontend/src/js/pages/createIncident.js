import { getIncidentTypes } from "../services/incidentTypeService.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";
import { createIncident } from "../services/incidentService.js";

export async function initCreateIncidentPage() {
  const form = document.getElementById("create-incident-form");

  if (!form) {
    return;
  }

  const incidentTypes = await getIncidentTypes();

  const select = document.getElementById("incident-type");

  incidentTypes.forEach((type) => {
    const option = document.createElement("option");

    option.value = type.id;

    option.textContent = type.name;

    select.appendChild(option);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("incident-title").value;

    const incidentTypeId = document.getElementById("incident-type").value;

    const description = document.getElementById("incident-description").value;

    try {
      const incident = await createIncident({
        title,
        description,
        incident_type_id: Number(incidentTypeId),
      });

      window.location.href = `/incidents/${incident.id}`;
    } catch (err) {
      console.error(err);

      showError("Failed to create incident");
    }
  });

  console.log("Create Incident Page Loaded");
}
