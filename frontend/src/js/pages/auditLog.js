import { getAuditLogs } from "../services/auditLogService.js";

export async function initAuditLogsPage() {
  const container = document.getElementById("audit-log-list");

  if (!container) {
    return;
  }

  try {
    const logs = await getAuditLogs();

    renderAuditLogs(logs);
  } catch (err) {
    console.error(err);
  }
}

function renderAuditLogs(logs) {
  const container = document.getElementById("audit-log-list");

  container.innerHTML = logs
    .map((log) => {
      const details = JSON.parse(log.details || "{}");

      return `
        <article class="audit-card">
          <div class="audit-card__header">
            <h3>
              ${formatAction(log.action)}
            </h3>
            <span class="audit-card__date">
              ${log.created_at}
            </span>
          </div>
          <div class="audit-card__body">
            <p>
              <strong>Actor:</strong>
              User #${log.user_id}
            </p>
            <p>
              <strong>Target:</strong>
              ${log.entity_type} #${log.entity_id}
            </p>
            ${
              details.email
                ? `
                  <p>
                    <strong>Email:</strong>
                    ${details.email}
                  </p>
                `
                : ""
            }
            ${
              details.role
                ? `
                  <p>
                    <strong>Role:</strong>
                    ${details.role}
                  </p>
                `
                : ""
            }
            ${
              details.roleIds?.length
                ? `
                  <p>
                    <strong>Roles:</strong>
                    ${details.roleIds.join(", ")}
                  </p>
                `
                : ""
            }
            ${
              details.passwordReset
                ? `
                  <p>
                    <strong>Password Reset:</strong>
                    Yes
                  </p>
                `
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function formatAction(action) {
  const labels = {
    CREATE_USER: "Created User",

    UPDATE_USER: "Updated User",

    ENABLE_USER: "Enabled User",

    DISABLE_USER: "Disabled User",
  };

  return labels[action] || action;
}
