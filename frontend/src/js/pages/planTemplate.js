import { getTemplates } from "../services/planTemplateService.js";

export async function initTemplatesPage() {
  const container = document.getElementById("template-list");

  if (!container) {
    return;
  }

  try {
    const templates = await getTemplates();

    renderTemplates(templates);
  } catch (err) {
    console.error(err);
  }
}

function renderTemplates(templates) {
  const container = document.getElementById("template-list");

  console.log(templates);

  container.innerHTML = templates
    .map(
      (template) => `
          <div class="card">

            <h2>
              ${template.title}
            </h2>

            <p>
              Version:
              ${template.version}
            </p>

            <p>
              Status:
              ${template.status}
            </p>

            <div
              class="card-actions"
            >

              <button
                class="btn btn-secondary btn-view-template"
                data-template-id="${template.id}"
              >
                View
              </button>

              <button
                class="btn btn-primary btn-clone-template"
                data-template-id="${template.id}"
              >
                Clone
              </button>

            </div>

          </div>
        `,
    )
    .join("");

  wireTemplateButtons();
}

function wireTemplateButtons() {
  document.querySelectorAll(".btn-clone-template").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.templateId;

      try {
        await cloneTemplate(id);

        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    });
  });
}
