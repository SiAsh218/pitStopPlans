import {
  getTemplateSummary,
  cloneTemplate,
} from "../services/planTemplateService.js";

import { showWarning } from "../utils/myAlert.js";

export async function initTemplatesPage() {
  const container = document.getElementById("template-list");

  if (!container) {
    return;
  }

  try {
    const templates = await getTemplateSummary();

    renderTemplates(templates);

    renderTemplates(templates);
  } catch (err) {
    console.error(err);
  }
}

function renderTemplates(templates) {
  const container = document.getElementById("template-list");

  const grouped = groupTemplates(templates);

  container.innerHTML = Object.entries(grouped)
    .map(
      ([name, versions]) => `
      
      <div class="card">

        <h2>
          ${name}
        </h2>

        <p>

          Active Version:

          ${
            versions.approved
              ? `
                v${versions.approved.version}
              `
              : "None"
          }

        </p>

        <p>

          Draft Version:

          ${
            versions.draft
              ? `
                v${versions.draft.version}
              `
              : "None"
          }

        </p>

        <div class="card-actions">

          ${
            versions.approved
              ? `
                <button
                  class="btn btn-secondary btn-view-template"
                  data-template-id="${versions.approved.id}"
                >
                  View Active
                </button>
              `
              : ""
          }

          ${
            versions.draft
              ? `
                <button
                  class="btn btn-secondary btn-view-template"
                  data-template-id="${versions.draft.id}"
                >
                  View Draft
                </button>
              `
              : ""
          }

          ${
            versions.approved && !versions.draft
              ? `
                <button
                  class="btn btn-primary btn-clone-template"
                  data-template-id="${versions.approved.id}"
                >
                  Create New Version
                </button>
              `
              : ""
          }

        </div>

      </div>

    `,
    )
    .join("");

  wireTemplateButtons();
}

function wireTemplateButtons() {
  document.querySelectorAll(".btn-view-template").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.templateId;

      window.location.href = `/templates/${id}`;
    });
  });

  document.querySelectorAll(".btn-clone-template").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.templateId;

      try {
        const template = await cloneTemplate(id);

        window.location.href = `/templates/${template.id}`;
      } catch (err) {
        showWarning(err.message || "A draft already exists");
      }
    });
  });
}

function groupTemplates(templates) {
  const grouped = {};

  templates.forEach((template) => {
    const typeName = template.incident_type.name;

    if (!grouped[typeName]) {
      grouped[typeName] = {
        incidentType: template.incident_type,
        approved: null,
        draft: null,
      };
    }

    if (template.status === "approved") {
      if (
        !grouped[typeName].approved ||
        template.version > grouped[typeName].approved.version
      ) {
        grouped[typeName].approved = template;
      }
    }

    if (template.status === "draft") {
      grouped[typeName].draft = template;
    }
  });

  return grouped;
}
