import { getUsers, createUser, updateUser } from "../services/userService.js";
import { getRoles } from "../services/roleService.js";
import { showSuccess, showError } from "../utils/myAlert.js";

let allUsers = [];
let allRoles = [];

export async function initUsersPage() {
  const container = document.getElementById("users-list");

  if (!container) {
    return;
  }

  try {
    allRoles = await getRoles();
    await loadUsers();
  } catch (err) {
    console.error(err);

    showError(err.message || "Failed to load users");
  }
  wireSearch();
  wireCreateUserButton();
  wireCreateUserForm();
  wireCreateUserModal();
  wireEditUserModal();
  wireEditUserForm();
}

function wireCreateUserButton() {
  document.getElementById("btn-create-user")?.addEventListener("click", () => {
    const rolesContainer = document.getElementById("new-user-roles");

    rolesContainer.innerHTML = allRoles
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

        </div>

      </article>
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
    const user = allUsers.find((u) => u.id === userId);

    if (!user) {
      showError("User not found");
      return;
    }

    document.getElementById("edit-user-id").value = user.id;

    document.getElementById("edit-user-email").value = user.email;

    document.getElementById("edit-user-role").value = user.role;

    const roleContainer = document.getElementById("edit-user-roles");

    roleContainer.innerHTML = allRoles
      .map(
        (role) => `
          <label>
            <input
              type="checkbox"
              value="${role.id}"
              ${user.job_roles.some((r) => r.id === role.id) ? "checked" : ""}
            />

            ${role.name}
          </label>
          <br>
        `,
      )
      .join("");

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
