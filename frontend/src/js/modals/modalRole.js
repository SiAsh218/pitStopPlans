import { createRole } from "../services/roleService.js";
import { showSuccess, showError } from "../utils/myAlert.js";

export function initModalRole() {
  const modal = document.getElementById("modal-form-role");

  if (!modal) {
    return;
  }

  const form = modal.querySelector("form");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const name = document.getElementById("modal-role-name").value;

      await createRole({
        name,
      });

      showSuccess("Role created successfully");

      location.reload();
    } catch (err) {
      console.error(err);

      showError("Failed to create role");
    }
  });
}
