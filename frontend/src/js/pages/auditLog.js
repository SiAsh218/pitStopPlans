import { getAuditLogs } from "../services/auditLogService.js";
import { formatDateTime } from "../utils/dateHandler.js";

const state = {
  search: "",
  entityType: "",
  actionType: "",
  page: 1,
  limit: 25,
};

export async function initAuditLogsPage() {
  const container = document.getElementById("audit-log-list");

  if (!container) {
    return;
  }

  wireAuditLogControls();
  await loadAuditLogs();
}

async function loadAuditLogs() {
  const listContainer = document.getElementById("audit-log-list");
  const paginationContainer = document.getElementById("audit-log-pagination");

  if (!listContainer || !paginationContainer) {
    return;
  }

  listContainer.innerHTML = `
    <div class="card empty-state">
      <p>Loading audit logs...</p>
    </div>
  `;

  try {
    const response = await getAuditLogs({
      search: state.search,
      entity_type: state.entityType || undefined,
      action: state.actionType || undefined,
      limit: state.limit,
      page: state.page,
    });

    renderAuditLogs(response.data);
    renderPagination(response.meta);
  } catch (err) {
    console.error(err);

    listContainer.innerHTML = `
      <div class="card empty-state">
        <p>Unable to load audit logs.</p>
      </div>
    `;

    paginationContainer.innerHTML = "";
  }
}

function wireAuditLogControls() {
  const searchInput = document.getElementById("audit-log-search");
  const entityTypeSelect = document.getElementById("audit-log-entity-type");
  const actionTypeSelect = document.getElementById("audit-log-action-type");
  const pageSizeSelect = document.getElementById("audit-log-page-size");
  const refreshButton = document.getElementById("audit-log-refresh");

  searchInput?.addEventListener("input", async (event) => {
    state.search = event.target.value.trim();
    state.page = 1;
    await loadAuditLogs();
  });

  entityTypeSelect?.addEventListener("change", async (event) => {
    state.entityType = event.target.value;
    state.page = 1;
    await loadAuditLogs();
  });

  actionTypeSelect?.addEventListener("change", async (event) => {
    state.actionType = event.target.value;
    state.page = 1;
    await loadAuditLogs();
  });

  pageSizeSelect?.addEventListener("change", async (event) => {
    state.limit = Number(event.target.value) || 25;
    state.page = 1;
    await loadAuditLogs();
  });

  refreshButton?.addEventListener("click", async () => {
    await loadAuditLogs();
  });
}

function renderAuditLogs(logs) {
  const container = document.getElementById("audit-log-list");

  if (!container) {
    return;
  }

  if (!logs || logs.length === 0) {
    container.innerHTML = `
      <div class="card empty-state">
        <p>No audit log entries available.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = logs
    .map((log) => {
      const details = safeParseDetails(log.details);
      const before = details.before || {};
      const after = details.after || {};
      const actor = log.actor_email || `User #${log.user_id}`;
      const target =
        log.target_title ||
        log.target_email ||
        `${formatEntityType(log.entity_type)} #${log.entity_id}`;

      return `
        <article class="audit-card">
          <div class="audit-card__header">
            <div>
              <h2>${formatAction(log.action)}</h2>
              <p>${formatDateTime(log.created_at)}</p>
            </div>
            <div class="audit-card__badges">
              <span class="audit-card__badge">${formatEntityType(log.entity_type)}</span>
            </div>
          </div>

          <div class="audit-card__details">
            <p><strong>Actor:</strong> ${actor}</p>
            <p><strong>Target:</strong> ${target}</p>
          </div>

          <div class="audit-card__meta">
            ${renderPropertyChange("Title", before.title, after.title)}
            ${renderPropertyChange("Status", before.status, after.status)}
            ${renderPropertyValue("Incident Type", details.incidentTypeName)}
            ${renderPropertyValue("Source Template", details.sourceTemplateId ? `#${details.sourceTemplateId}` : null)}
            ${renderPropertyValue("Password Reset", details.passwordReset ? "Yes" : null)}
            ${renderPropertyValue("Email", details.email)}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderPagination(meta = {}) {
  const container = document.getElementById("audit-log-pagination");

  if (!container) {
    return;
  }

  if (!meta || meta.total === 0) {
    container.innerHTML = "";
    return;
  }

  const currentPage = meta.page || 1;
  const pageCount = meta.pageCount || 1;

  container.innerHTML = `
    <div class="pagination">
      <button id="audit-log-page-prev" class="btn btn-secondary" ${currentPage <= 1 ? "disabled" : ""}>
        Previous
      </button>

      <span class="pagination__summary">
        Page ${currentPage} of ${pageCount} • ${meta.total} entries
      </span>

      <button id="audit-log-page-next" class="btn btn-secondary" ${currentPage >= pageCount ? "disabled" : ""}>
        Next
      </button>
    </div>
  `;

  document
    .getElementById("audit-log-page-prev")
    ?.addEventListener("click", async () => {
      if (state.page <= 1) {
        return;
      }

      state.page -= 1;
      await loadAuditLogs();
    });

  document
    .getElementById("audit-log-page-next")
    ?.addEventListener("click", async () => {
      if (state.page >= pageCount) {
        return;
      }

      state.page += 1;
      await loadAuditLogs();
    });
}

function safeParseDetails(details) {
  try {
    return JSON.parse(details || "{}");
  } catch (err) {
    return {};
  }
}

function renderPropertyChange(label, beforeValue, afterValue) {
  if (beforeValue === undefined && afterValue === undefined) {
    return "";
  }

  if (beforeValue === afterValue) {
    return `<p><strong>${label}:</strong> ${beforeValue ?? "—"}</p>`;
  }

  return `<p><strong>${label}:</strong> ${beforeValue ?? "—"} → ${afterValue ?? "—"}</p>`;
}

function renderPropertyValue(label, value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return `<p><strong>${label}:</strong> ${value}</p>`;
}

function formatAction(action) {
  const labels = {
    CREATE_USER: "Created User",
    UPDATE_USER: "Updated User",
    ENABLE_USER: "Enabled User",
    DISABLE_USER: "Disabled User",
    CREATE_TEMPLATE: "Created Template",
    UPDATE_TEMPLATE: "Updated Template",
    APPROVE_TEMPLATE: "Approved Template",
    CLONE_TEMPLATE: "Cloned Template",
    RETIRE_TEMPLATE: "Retired Template",
  };

  return labels[action] || action;
}

function formatEntityType(entityType) {
  const labels = {
    user: "User",
    plan_template: "Template",
  };

  return labels[entityType] || entityType;
}
