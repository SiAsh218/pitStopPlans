import { getRoles, createRole, updateRole } from "../services/roleService.js";
import { showSuccess, showError } from "../utils/myAlert.js";
import { getCurrentUser } from "../auth.js";

let allRoles = [];

const roleState = {
  search: "",
  page: 1,
  limit: 10,
};

export async function initRolesPage() {
  const container = document.getElementById("roles-list");

  if (!container) {
    return;
  }

  const user = getCurrentUser();

  if (!user || user.role !== "admin") {
    window.location.href = "/";
  }

  wireSearch();
  wireAddRoleButton();
  await loadRoles();
}

async function loadRoles() {
  try {
    allRoles = await getRoles();
    roleState.page = 1;
    renderCurrentPage();
  } catch (err) {
    console.error(err);
    showError(err.message || "Failed to load operational roles");
  }
}

function renderRoles(roles) {
  const container = document.getElementById("roles-list");

  if (!container) {
    return;
  }

  if (!roles.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No operational roles found.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = roles
    .map(
      (role) => `
        <article class="card">
          <div class="card__content">
            <h2>${role.name}</h2>
            <span class="badge ${role.active ? "badge--active" : "badge--disabled"}">
              ${role.active ? "Active" : "Disabled"}
            </span>
          </div>

          <div class="card__actions">
            <button class="btn btn-secondary btn-edit-role" data-role-id="${role.id}" data-role-name="${role.name}">
              Edit
            </button>
            <button class="btn btn-secondary btn-toggle-role" data-role-id="${role.id}" data-role-active="${role.active}">
              ${role.active ? "Disable" : "Enable"}
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  wireEditButtons();
  wireToggleButtons();
}

function wireEditButtons() {
  document.querySelectorAll(".btn-edit-role").forEach((button) => {
    button.addEventListener("click", () => {
      const roleId = Number(button.dataset.roleId);
      const roleName = button.dataset.roleName || "";

      const modal = document.getElementById("modal-form-role");
      const roleTitle = document.getElementById("modal-role-title");
      const roleNameInput = document.getElementById("modal-role-name");
      const roleIdInput = document.getElementById("modal-role-id");
      const roleSubmit = document.getElementById("modal-role-submit");

      if (
        !modal ||
        !roleTitle ||
        !roleNameInput ||
        !roleIdInput ||
        !roleSubmit
      ) {
        return;
      }

      roleTitle.textContent = "Edit Operational Role";
      roleSubmit.textContent = "Save Changes";
      roleNameInput.value = roleName;
      roleIdInput.value = String(roleId);
      modal.classList.remove("hidden");
    });
  });
}

function wireToggleButtons() {
  document.querySelectorAll(".btn-toggle-role").forEach((button) => {
    button.addEventListener("click", async () => {
      const roleId = Number(button.dataset.roleId);
      const isActive = Number(button.dataset.roleActive) === 1;

      try {
        await updateRole(roleId, { active: !isActive });
        showSuccess(`Role ${isActive ? "disabled" : "enabled"} successfully`);
        await loadRoles();
      } catch (err) {
        showError(err.message || "Failed to update role status");
      }
    });
  });
}

function getFilteredRoles() {
  return allRoles.filter((role) => {
    const searchTerm = roleState.search;
    const name = role.name.toLowerCase();

    return !searchTerm || name.includes(searchTerm);
  });
}

function getPaginatedRoles(filteredRoles) {
  const total = filteredRoles.length;
  const pageCount = Math.max(1, Math.ceil(total / roleState.limit));
  const page = Math.min(Math.max(1, roleState.page), pageCount);
  const offset = (page - 1) * roleState.limit;

  return {
    rows: filteredRoles.slice(offset, offset + roleState.limit),
    meta: {
      total,
      limit: roleState.limit,
      page,
      pageCount,
    },
  };
}

function renderCurrentPage() {
  const filteredRoles = getFilteredRoles();
  const { rows, meta } = getPaginatedRoles(filteredRoles);

  renderRoles(rows);
  renderPagination(meta);
}

function renderPagination(meta = {}) {
  const container = document.getElementById("roles-pagination");

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
      <button id="roles-page-prev" class="btn btn-secondary" ${
        currentPage <= 1 ? "disabled" : ""
      }>
        Previous
      </button>

      <span class="pagination__summary">
        Page ${currentPage} of ${pageCount} • ${meta.total} roles
      </span>

      <button id="roles-page-next" class="btn btn-secondary" ${
        currentPage >= pageCount ? "disabled" : ""
      }>
        Next
      </button>
    </div>
  `;

  document.getElementById("roles-page-prev")?.addEventListener("click", () => {
    if (roleState.page <= 1) {
      return;
    }

    roleState.page -= 1;
    renderCurrentPage();
  });

  document.getElementById("roles-page-next")?.addEventListener("click", () => {
    if (roleState.page >= pageCount) {
      return;
    }

    roleState.page += 1;
    renderCurrentPage();
  });
}

function wireSearch() {
  const searchInput = document.getElementById("role-search");

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", () => {
    roleState.search = searchInput.value.toLowerCase().trim();
    roleState.page = 1;
    renderCurrentPage();
  });
}

function wireAddRoleButton() {
  document.getElementById("btn-add-role")?.addEventListener("click", () => {
    const modal = document.getElementById("modal-form-role");
    const roleTitle = document.getElementById("modal-role-title");
    const roleNameInput = document.getElementById("modal-role-name");
    const roleIdInput = document.getElementById("modal-role-id");
    const roleSubmit = document.getElementById("modal-role-submit");

    if (!modal || !roleTitle || !roleNameInput || !roleIdInput || !roleSubmit) {
      return;
    }

    roleTitle.textContent = "Add Operational Role";
    roleSubmit.textContent = "Create Role";
    roleNameInput.value = "";
    roleIdInput.value = "";
    modal.classList.remove("hidden");
  });
}
