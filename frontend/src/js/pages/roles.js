import { getRoles, createRole, updateRole } from "../services/roleService.js";
import { showSuccess, showError } from "../utils/myAlert.js";
import { getCurrentUser } from "../auth.js";

const roleState = {
  search: "",
  page: 1,
  limit: 100,
  roles: [],
  paginationMeta: null,
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
    const result = await getRoles({
      page: roleState.page,
      limit: roleState.limit,
      search: roleState.search || undefined,
    });

    roleState.roles = result.data;
    roleState.paginationMeta = result.meta;

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

function renderCurrentPage() {
  renderRoles(roleState.roles);
  renderPagination(roleState.paginationMeta);
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

  document
    .getElementById("roles-page-prev")
    ?.addEventListener("click", async () => {
      if (roleState.page <= 1) {
        return;
      }

      roleState.page -= 1;
      await loadRoles();
    });

  document
    .getElementById("roles-page-next")
    ?.addEventListener("click", async () => {
      if (roleState.page >= pageCount) {
        return;
      }

      roleState.page += 1;
      await loadRoles();
    });
}

function wireSearch() {
  const searchInput = document.getElementById("role-search");

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", async () => {
    roleState.search = searchInput.value.trim();
    roleState.page = 1;

    await loadRoles();
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
