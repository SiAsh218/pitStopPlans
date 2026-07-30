import { getAuditLogs } from "../services/auditLogService.js";
import { formatDateTime } from "../utils/dateHandler.js";

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

                    <div>
                      <h2>
                        ${formatAction(log.action)}
                      </h2>

                      <p>
                        ${formatDateTime(log.created_at)}
                      </p>
                    </div>

                    <div class="audit-card__badges">

                      <span class="audit-card__badge">
                        ${log.entity_type}
                      </span>

                    </div>

                  </div>

                  <div class="audit-card__details">

                    <p>
                      <strong>Actor:</strong>
                      ${log.actor_email || `User #${log.user_id}`}
                    </p>

                    <p>
                      <strong>Target:</strong>
                      ${log.target_email || `${log.entity_type} #${log.entity_id}`}
                    </p>

                  </div>

                  <div class="audit-card__roles">

                    ${
                      details.roleNames?.length
                        ? details.roleNames
                            .map(
                              (role) => `
                                <span class="audit-card__badge">
                                  ${role}
                                </span>
                              `,
                            )
                            .join("")
                        : ""
                    }

                  </div>

                  <div class="audit-card__meta">

                    ${
                      details.role
                        ? `
                          <p>
                            <strong>Application Role:</strong>
                            ${details.role}
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
