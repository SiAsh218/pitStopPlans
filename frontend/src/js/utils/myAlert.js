let alertContainer;

function createContainer() {
  if (alertContainer) return alertContainer;

  alertContainer = document.createElement("div");
  alertContainer.className = "my-alert-container";

  document.body.appendChild(alertContainer);

  return alertContainer;
}

export function showAlert(message, type = "success", duration = 3000) {
  const container = createContainer();

  const alert = document.createElement("div");

  alert.className = `my-alert my-alert--${type}`;
  alert.textContent = message;

  container.appendChild(alert);

  setTimeout(() => {
    alert.classList.add("my-alert--hide");

    setTimeout(() => {
      alert.remove();
    }, 300);
  }, duration);
}

export function showSuccess(message, duration) {
  showAlert(message, "success", duration);
}

export function showWarning(message, duration) {
  showAlert(message, "warning", duration);
}

export function showError(message, duration) {
  showAlert(message, "error", duration);
}
