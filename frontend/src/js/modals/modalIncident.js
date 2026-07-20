export function initModalIncident() {
  const form = document.getElementById("incident-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    console.log("Create Incident");
  });
}
