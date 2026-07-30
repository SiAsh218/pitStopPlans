import { getUsers, updateUserRoles } from "../services/userService.js";
import { getRoles } from "../services/roleService.js";
import { showSuccess, showError } from "../utils/myAlert.js";

let allUsers = [];

export async function initUsersPage() {
  const container = document.getElementById("users-list");

  if (!container) {
    return;
  }

  try {
    await loadUsers();
  } catch (err) {
    console.error(err);

    showError(err.message || "Failed to load users");
  }
  wireSearch();
}

async function loadUsers() {
  allUsers = await getUsers();

  renderUsers(allUsers);
}

function renderUsers(users) {
  const container = document.getElementById("users-list");

  if (!container) {
    return;
  }

  container.innerHTML = users
    .map(
      (user) => `
        <div class="card">

          <h3>${user.email}</h3>

          <p>
            <strong>
              Application Role:
            </strong>
            ${user.role}
          </p>

          <div class="user-role-chips">
            ${
              user.job_roles.length
                ? user.job_roles
                    .map(
                      (role) => `
                        <span class="chip">
                          ${role.name}
                        </span>
                      `,
                    )
                    .join("")
                : `
                  <span class="chip">
                    No Roles
                  </span>
                `
            }
          </div>

          <button
            class="btn btn-primary btn-edit-user"
            data-user-id="${user.id}"
          >
            Edit Roles
          </button>

        </div>
      `,
    )
    .join("");

  wireEditButtons();
}

function wireEditButtons() {
  document.querySelectorAll(".btn-edit-user").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = Number(button.dataset.userId);

      await openEditUserModal(userId);
    });
  });
}

async function openEditUserModal(userId) {
  try {
    const users = await getUsers();

    const roles = await getRoles();

    const user = users.find((u) => u.id === userId);

    if (!user) {
      showError("User not found");
      return;
    }

    const modal = document.getElementById("user-role-modal");

    if (!modal) {
      return;
    }

    modal.classList.remove("hidden");

    modal.innerHTML = `
      <div class="card">

        <h2>
          Edit Roles
        </h2>

        <p>
          ${user.email}
        </p>

        <div class="role-list">

          ${roles
            .map(
              (role) => `
                <label>

                  <input
                    type="checkbox"
                    value="${role.id}"

                    ${
                      user.job_roles.some((r) => r.id === role.id)
                        ? "checked"
                        : ""
                    }
                  />

                  ${role.name}

                </label>

                <br />
              `,
            )
            .join("")}

        </div>

        <br />

        <button
          id="btn-save-user-roles"
          class="btn btn-primary"
        >
          Save
        </button>

        <button
          id="btn-close-user-modal"
          class="btn btn-secondary"
        >
          Cancel
        </button>

      </div>
    `;

    wireSaveUserRoles(userId, modal);

    wireCloseModal(modal);
  } catch (err) {
    console.error(err);

    showError(err.message || "Failed to open user editor");
  }
}

function wireSaveUserRoles(userId, modal) {
  document
    .getElementById("btn-save-user-roles")
    ?.addEventListener("click", async () => {
      try {
        const roleIds = [
          ...modal.querySelectorAll("input[type='checkbox']:checked"),
        ].map((checkbox) => Number(checkbox.value));

        await updateUserRoles(userId, roleIds);

        showSuccess("Roles updated successfully");

        modal.classList.add("hidden");

        modal.innerHTML = "";

        await loadUsers();

        const searchInput = document.getElementById("user-search");

        searchInput?.dispatchEvent(new Event("input"));
      } catch (err) {
        console.error(err);

        showError(err.message || "Failed to update roles");
      }
    });
}

function wireCloseModal(modal) {
  document
    .getElementById("btn-close-user-modal")
    ?.addEventListener("click", () => {
      modal.classList.add("hidden");

      modal.innerHTML = "";
    });
}

function wireSearch() {
  const searchInput = document.getElementById("user-search");

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredUsers = allUsers.filter((user) => {
      const email = user.email.toLowerCase();

      const role = user.role.toLowerCase();

      const jobRoles = user.job_roles
        .map((r) => r.name)
        .join(" ")
        .toLowerCase();

      return (
        email.includes(searchTerm) ||
        role.includes(searchTerm) ||
        jobRoles.includes(searchTerm)
      );
    });

    renderUsers(filteredUsers);
  });
}
