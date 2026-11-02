import { getIncidentTypes } from "../services/incidentTypeService.js";
import { getTemplateSummary } from "../services/planTemplateService.js";
import { showWarning, showError } from "../utils/myAlert.js";
import { createIncident } from "../services/incidentService.js";
import { copyToClipboard } from "../utils/copyToClipboard.js";
import stationData from "../../../../shared/stations.json";

const { stations } = stationData;
const sortedStations = [...stations].sort((first, second) =>
  first.localeCompare(second, undefined, { sensitivity: "base" }),
);

export async function initCreateIncidentPage() {
  const form = document.getElementById("create-incident-form");

  if (!form) {
    return;
  }

  const [incidentTypes, templates] = await Promise.all([
    getIncidentTypes(),
    getTemplateSummary(),
  ]);
  const activeIncidentTypeIds = new Set(
    templates
      .filter((template) => template.status === "approved")
      .map((template) => template.incident_type.id),
  );

  const select = document.getElementById("incident-type");
  const stationSelect = document.getElementById("nearest-station");

  sortedStations.forEach((station) => {
    const option = document.createElement("option");
    option.value = station;
    option.textContent = station;
    stationSelect.appendChild(option);
  });

  const sortedIncidentTypes = incidentTypes
    .filter((type) => activeIncidentTypeIds.has(type.id))
    .sort((first, second) =>
      first.name.localeCompare(second.name, undefined, {
        sensitivity: "base",
      }),
    );

  sortedIncidentTypes.forEach((type) => {
    const option = document.createElement("option");

    option.value = type.id;

    option.textContent = type.name;

    select.appendChild(option);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Creating Incident...";

    const title = document.getElementById("incident-title").value;
    const incidentTypeSelect = document.getElementById("incident-type");
    const incidentTypeId = incidentTypeSelect.value;
    const incidentType =
      incidentTypeSelect.options[incidentTypeSelect.selectedIndex].text;
    const description = document.getElementById("incident-description").value;
    const nearestStation = stationSelect.value || null;

    try {
      const incident = await createIncident({
        title,
        description,
        incident_type_id: Number(incidentTypeId),
        nearest_station: nearestStation,
      });

      const html = buildIncidentClipboardHtml(
        title,
        incidentType,
        description,
        nearestStation,
      );
      const text = buildIncidentClipboardText(
        title,
        incidentType,
        description,
        nearestStation,
      );
      await copyToClipboard(html, text, null);

      sessionStorage.setItem(
        "incident-created-notice",
        "Holding message data copied to clipboard",
      );
      window.location.href = `/incidents/${incident.id}`;
    } catch (err) {
      console.error(err);

      submitButton.disabled = false;
      submitButton.textContent = "Create Incident";

      showError("Failed to create incident");
    }
  });
}

function buildIncidentClipboardText(
  title,
  incidentType,
  description,
  nearestStation,
) {
  return `NEW INCIDENT

Incident Title: ${title}
Incident Type: ${incidentType}
Nearest Station: ${nearestStation || "Not specified"}

${description}
`.trim();
}

function buildIncidentClipboardHtml(
  title,
  incidentType,
  description,
  nearestStation,
) {
  const formattedDescription = description.replace(/\n/g, "<br>");

  return `
<h2>NEW INCIDENT</h2>

<p>
  <strong>Incident Title:</strong> ${title}<br>
  <strong>Incident Type:</strong> ${incidentType}<br><br>
  <strong>Nearest Station:</strong> ${nearestStation || "Not specified"}<br><br>
  <span> ${formattedDescription}</span>
</p>`.trim();
}
