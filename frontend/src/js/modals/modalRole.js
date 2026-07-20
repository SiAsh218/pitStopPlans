// import { addIncidentRole } from "../state/incidentState.js";
import { resetFormInputs, renderFullPlan } from "../components/modal.js";
import { showSuccess, showWarning, showError } from "../utils/myAlert.js";
import { getRolesFromDB } from "../services/roleService.js";

export function initModalRole() {
  const modal = document.getElementById("modal-form-incident-role");
  if (!modal) return;
  const form = modal.querySelector("form");

  renderRoleOptions();

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = getData();

    addIncidentRole(data);

    showSuccess("Role created successfully");

    resetFormInputs(form);

    renderFullPlan();
  });
}

function getData() {
  const inputRole = document.getElementById("modal-form-incident--role");

  const roleId = inputRole.value;
  const roleName = inputRole.options[inputRole.selectedIndex].text;

  return { name: roleName, id: roleId };
}

async function renderRoleOptions() {
  try {
    const roles = await getRolesFromDB();

    const roleSelector = document.getElementById("modal-form-incident--role");

    roleSelector.innerHTML = `<option value=""></option>`;

    roles.forEach((role) => {
      roleSelector.insertAdjacentHTML(
        "beforeend",
        `<option value="${role.id}">${role.name}</option>`,
      );
    });
  } catch (err) {
    if (err.message === "Invalid token") {
      // User isn't logged in, ignore or hide role selector
      return;
    }

    console.error(err);

    showError("Failed to load roles");
  }
}
