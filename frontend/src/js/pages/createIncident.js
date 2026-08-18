import { getIncidentTypes } from "../services/incidentTypeService.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";
import { createIncident } from "../services/incidentService.js";
import { copyToClipboard } from "../utils/copyToClipboard.js";

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
    const incidentTypeSelect = document.getElementById("incident-type");
    const incidentTypeId = incidentTypeSelect.value;
    const incidentType =
      incidentTypeSelect.options[incidentTypeSelect.selectedIndex].text;
    const description = document.getElementById("incident-description").value;

    try {
      const incident = await createIncident({
        title,
        description,
        incident_type_id: Number(incidentTypeId),
      });

      const html = buildIncidentClipboardHtml(title, incidentType, description);
      const text = buildIncidentClipboardText(title, incidentType, description);
      await copyToClipboard(html, text);

      setTimeout(() => {
        window.location.href = `/incidents/${incident.id}`;
      }, 1000);
    } catch (err) {
      console.error(err);

      showError("Failed to create incident");
    }
  });
}

function buildIncidentClipboardText(title, incidentType, description) {
  return `HOLDING MESSAGE

Incident Title: ${title}
Incident Type: ${incidentType}

${description}
`.trim();
}

function buildIncidentClipboardHtml(title, incidentType, description) {
  const formattedDescription = description.replace(/\n/g, "<br>");

  return `
<h2>HOLDING MESSAGE</h2>

<p>
  <strong>Incident Title:</strong> ${title}<br>
  <strong>Incident Type:</strong> ${incidentType}<br><br>
  <span> ${formattedDescription}</span>
</p>`.trim();
}
