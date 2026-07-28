import {
  getTemplateSummary,
  cloneTemplate,
  createTemplateTemplate,
} from "../services/planTemplateService.js";

import { showWarning, showSuccess, showError } from "../utils/myAlert.js";

export async function initTemplatesPage() {
  const container = document.getElementById("template-list");

  if (!container) {
    return;
  }

  try {
    const templates = await getTemplateSummary();

    renderTemplates(templates);
    wireCreateTemplateButton();
  } catch (err) {
    console.error(err);
  }
}

function renderTemplates(templates) {
  const container = document.getElementById("template-list");

  if (!container) {
    return;
  }

  const grouped = groupTemplates(templates);

  if (!Object.keys(grouped).length) {
    container.innerHTML = `
      <div class="card empty-state">
        <p>No templates found yet.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = Object.entries(grouped)
    .map(
      ([name, versions]) => `
      <article class="template-card">
        <div class="template-card__header">
          <div>
            <h2>${name}</h2>
            <p>${versions.incidentType?.name || name}</p>
          </div>

          <div class="template-card__badges">
            <span class="template-card__badge ${versions.approved ? "template-card__badge--approved" : ""}">
              Active: ${versions.approved ? `v${versions.approved.version}` : "None"}
            </span>
            <span class="template-card__badge ${versions.draft ? "template-card__badge--draft" : ""}">
              Draft: ${versions.draft ? `v${versions.draft.version}` : "None"}
            </span>
          </div>
        </div>

        <div class="template-card__actions">
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
      </article>
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

function wireCreateTemplateButton() {
  const button = document.getElementById("btn-create-template");
  const modal = document.getElementById("modal-form-template-create");
  const form = document.getElementById("form-create-template");

  if (!button || !modal || !form) {
    return;
  }

  button.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      incidentType: {
        name: document
          .getElementById("modal-template-incident-name")
          .value.trim(),
        description: document
          .getElementById("modal-template-incident-description")
          .value.trim(),
      },
      title: document.getElementById("modal-template-title").value.trim(),
    };

    if (!payload.incidentType.name || !payload.title) {
      showError("Please complete the incident type and template title.");
      return;
    }

    try {
      const template = await createTemplateTemplate(payload);
      modal.classList.add("hidden");
      form.reset();
      showSuccess("Template created successfully.");
      window.location.href = `/templates/${template.id}`;
    } catch (err) {
      showError(err.message || "Unable to create template.");
    }
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
