import {
  getUsers,
  createUser,
  updateUser,
  disableUser,
  enableUser,
} from "../services/userService.js";
import { getRoles } from "../services/roleService.js";
import { showSuccess, showError } from "../utils/myAlert.js";

import { getCurrentUser } from "../auth.js";

let allRoles = [];

const userState = {
  search: "",
  role: "all",
  appRole: "all",
  active: "all",
  page: 1,
  limit: 50,
  users: [],
  paginationMeta: null,
};

let editingUser = null;

export async function initUsersPage() {
  const container = document.getElementById("users-list");

  if (!container) {
    return;
  }

  const user = getCurrentUser();

  if (!user || user.role !== "admin") {
    window.location.href = "/";
  }

  try {
    allRoles = await getRoles();
    renderRoleFilterOptions();
    await loadUsers();
  } catch (err) {
    console.error(err);

    showError(err.message || "Failed to load users");
  }

  wireSearch();
  wireFilterInputs();
  wireRefreshUsers();
  wireCreateUserButton();
  wireCreateUserForm();
  wireCreateUserModal();
  wireEditUserModal();
  wireEditUserForm();
}

function renderNewUserRoles(showDisabled = false) {
  const rolesContainer = document.getElementById("new-user-roles");
  if (!rolesContainer) {
    return;
  }

  const visibleRoles = allRoles.filter((role) => role.active || showDisabled);

  rolesContainer.innerHTML = visibleRoles
    .map(
      (role) => `
            <label>
              <input
                type="checkbox"
                value="${role.id}"
              />

              ${role.name}
            </label>
            <br>
          `,
    )
    .join("");
}

function renderEditUserRoles(user, showDisabled = false) {
  const roleContainer = document.getElementById("edit-user-roles");
  if (!roleContainer) {
    return;
  }

  const selectedRoleIds = user.job_roles.map((role) => role.id);

  const visibleRoles = allRoles.filter(
    (role) => role.active || showDisabled || selectedRoleIds.includes(role.id),
  );

  roleContainer.innerHTML = visibleRoles
    .map(
      (role) => `
          <label>
            <input
              type="checkbox"
              value="${role.id}"
              ${selectedRoleIds.includes(role.id) ? "checked" : ""}
            />

            ${role.name}${!role.active ? " (disabled)" : ""}
          </label>
          <br>
        `,
    )
    .join("");
}

function wireCreateUserButton() {
  document.getElementById("btn-create-user")?.addEventListener("click", () => {
    const showDisabledToggle = document.getElementById(
      "show-disabled-new-user-roles",
    );

    if (showDisabledToggle) {
      showDisabledToggle.checked = false;
      showDisabledToggle.onchange = () =>
        renderNewUserRoles(showDisabledToggle.checked);
    }

    renderNewUserRoles(false);

    document
      .getElementById("modal-form-create-user")
      ?.classList.remove("hidden");
  });
}

function wireEditUserForm() {
  document
    .getElementById("edit-user-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const userId = Number(document.getElementById("edit-user-id").value);

        const roleIds = [
          ...document.querySelectorAll("#edit-user-roles input:checked"),
        ].map((checkbox) => Number(checkbox.value));

        const role = document.getElementById("edit-user-role").value;

        const password = document.getElementById("edit-user-password").value;

        const confirmPassword = document.getElementById(
          "edit-user-password-confirm",
        ).value;

        if (password && password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        await updateUser(userId, {
          role,
          role_ids: roleIds,
          password,
        });

        showSuccess("User updated successfully");

        document.getElementById("edit-user-password").value = "";

        document.getElementById("edit-user-password-confirm").value = "";

        document
          .getElementById("modal-form-edit-user")
          ?.classList.add("hidden");

        await loadUsers();

        const searchInput = document.getElementById("user-search");

        searchInput?.dispatchEvent(new Event("input"));
      } catch (err) {
        showError(err.message);
      }
    });
}

function wireCreateUserModal() {
  const modal = document.getElementById("modal-form-create-user");

  document
    .getElementById("btn-close-create-user")
    ?.addEventListener("click", () => {
      modal?.classList.add("hidden");
    });

  modal
    ?.querySelector(".modal-form__overlay")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
}

function wireCreateUserForm() {
  document
    .getElementById("create-user-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const roleIds = [
          ...document.querySelectorAll("#new-user-roles input:checked"),
        ].map((checkbox) => Number(checkbox.value));

        await createUser(
          document.getElementById("new-user-email").value,
          document.getElementById("new-user-password").value,
          document.getElementById("new-user-role").value,
          roleIds,
        );

        showSuccess("User created successfully");

        document
          .getElementById("modal-form-create-user")
          ?.classList.add("hidden");

        event.target.reset();

        await loadUsers();
      } catch (err) {
        showError(err.message);
      }
    });
}

async function loadUsers() {
  const result = await getUsers({
    page: userState.page,
    limit: userState.limit,

    search: userState.search || undefined,

    active: userState.active === "all" ? undefined : userState.active,

    role: userState.role === "all" ? undefined : userState.role,

    appRole: userState.appRole === "all" ? undefined : userState.appRole,
  });

  userState.users = result.data;
  userState.paginationMeta = result.meta;

  renderCurrentPage();
}

function renderUsers(users) {
  const container = document.getElementById("users-list");

  if (!container) {
    return;
  }

  container.innerHTML = users
    .map(
      (user) => `
      <article class="user-card">
        <div class="user-card__header">

          <div>
            <h2>${user.email}</h2>

            <p>
              Application Role:
              ${user.role}
            </p>
          </div>

          <div class="user-card__badges">

            <span
              class="
                user-card__badge
                ${user.role === "admin" ? "user-card__badge--admin" : ""}
              "
            >
              ${user.role}
            </span>

            <span
              class="
                user-card__badge
                ${
                  user.active
                    ? "user-card__badge--active"
                    : "user-card__badge--disabled"
                }
              "
            >
              ${user.active ? "Active" : "Disabled"}
            </span>

          </div>

        </div>

        <div class="user-card__roles">

          ${
            user.job_roles.length
              ? user.job_roles
                  .map(
                    (role) => `
                      <span class="user-card__badge">
                        ${role.name}
                      </span>
                    `,
                  )
                  .join("")
              : `
                <span class="user-card__badge">
                  No Roles
                </span>
              `
          }

        </div>

        <div class="user-card__actions">

          <button
            class="btn btn-primary btn-edit-user"
            data-user-id="${user.id}"
          >
            Edit User
          </button>

          ${
            user.active
              ? `
                <button
                  class="btn btn-secondary btn-disable-user"
                  style="margin-left: 8px"
                  data-user-id="${user.id}"
                >
                  Disable User
                </button>
              `
              : `
                <button
                  class="btn btn-secondary btn-enable-user"
                  data-user-id="${user.id}"
                >
                  Enable User
                </button>
              `
          }

        </div>

      </article>
    `,
    )
    .join("");

  wireEditButtons();
  wireDisableButtons();
  wireEnableButtons();
}

function wireEditButtons() {
  document.querySelectorAll(".btn-edit-user").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = Number(button.dataset.userId);

      await openEditUserModal(userId);
    });
  });
}

function renderRoleFilterOptions() {
  const roleSelect = document.getElementById("user-role-filter");

  if (!roleSelect) {
    return;
  }

  roleSelect.innerHTML = `
    <option value="all">All</option>
    ${allRoles
      .map((role) => `<option value="${role.name}">${role.name}</option>`)
      .join("")}
  `;
}

function renderCurrentPage() {
  renderUsers(userState.users);
  renderPagination(userState.paginationMeta);
}

function renderPagination(meta = {}) {
  const container = document.getElementById("user-pagination");

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
      <button id="user-page-prev" class="btn btn-secondary" ${
        currentPage <= 1 ? "disabled" : ""
      }>
        Previous
      </button>

      <span class="pagination__summary">
        Page ${currentPage} of ${pageCount} • ${meta.total} users
      </span>

      <button id="user-page-next" class="btn btn-secondary" ${
        currentPage >= pageCount ? "disabled" : ""
      }>
        Next
      </button>
    </div>
  `;

  document
    .getElementById("user-page-prev")
    ?.addEventListener("click", async () => {
      if (userState.page <= 1) {
        return;
      }

      userState.page -= 1;
      await loadUsers();
    });

  document
    .getElementById("user-page-next")
    ?.addEventListener("click", async () => {
      if (userState.page >= pageCount) {
        return;
      }

      userState.page += 1;
      await loadUsers();
    });
}

function wireDisableButtons() {
  document.querySelectorAll(".btn-disable-user").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await disableUser(Number(button.dataset.userId));

        showSuccess("User disabled successfully");

        await loadUsers();
      } catch (err) {
        showError(err.message);
      }
    });
  });
}

function wireEnableButtons() {
  document.querySelectorAll(".btn-enable-user").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await enableUser(Number(button.dataset.userId));

        showSuccess("User enabled successfully");

        await loadUsers();
      } catch (err) {
        showError(err.message);
      }
    });
  });
}

async function openEditUserModal(userId) {
  try {
    const user = userState.users.find((u) => u.id === userId);

    if (!user) {
      showError("User not found");
      return;
    }

    editingUser = user;

    document.getElementById("edit-user-id").value = user.id;

    document.getElementById("edit-user-email").value = user.email;

    document.getElementById("edit-user-role").value = user.role;

    const showDisabledToggle = document.getElementById(
      "show-disabled-edit-user-roles",
    );

    if (showDisabledToggle) {
      showDisabledToggle.checked = false;
      showDisabledToggle.onchange = () =>
        renderEditUserRoles(user, showDisabledToggle.checked);
    }

    renderEditUserRoles(user, false);

    document.getElementById("edit-user-password").value = "";

    document.getElementById("edit-user-password-confirm").value = "";

    document.getElementById("modal-form-edit-user")?.classList.remove("hidden");
  } catch (err) {
    console.error(err);

    showError(err.message || "Failed to open user editor");
  }
}

function wireEditUserModal() {
  const modal = document.getElementById("modal-form-edit-user");

  document
    .getElementById("btn-close-edit-user")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

  modal
    ?.querySelector(".modal-form__overlay")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
}

function wireSearch() {
  const searchInput = document.getElementById("user-search");

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", async () => {
    userState.search = searchInput.value.toLowerCase().trim();
    userState.page = 1;
    await loadUsers();
  });
}

function wireFilterInputs() {
  const roleSelect = document.getElementById("user-role-filter");
  const appRoleSelect = document.getElementById("user-app-role-filter");
  const statusSelect = document.getElementById("user-status-filter");

  if (!roleSelect || !appRoleSelect || !statusSelect) {
    return;
  }

  roleSelect.addEventListener("change", async () => {
    userState.role = roleSelect.value;
    userState.page = 1;
    await loadUsers();
  });

  appRoleSelect.addEventListener("change", async () => {
    userState.appRole = appRoleSelect.value;
    userState.page = 1;
    await loadUsers();
  });

  statusSelect.addEventListener("change", async () => {
    userState.active = statusSelect.value;
    userState.page = 1;
    await loadUsers();
  });
}

function wireRefreshUsers() {
  document
    .getElementById("btn-refresh-users")
    ?.addEventListener("click", async () => {
      await loadUsers();
    });
}
