export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal-confirm");

    const titleElement = document.getElementById("modal-confirm-title");

    const messageElement = document.getElementById("modal-confirm-message");

    const confirmButton = document.getElementById("modal-confirm-confirm");

    const cancelButton = document.getElementById("modal-confirm-cancel");

    titleElement.textContent = title;
    messageElement.textContent = message;

    modal.classList.remove("hidden");

    function cleanup(result) {
      modal.classList.add("hidden");

      confirmButton.removeEventListener("click", handleConfirm);

      cancelButton.removeEventListener("click", handleCancel);

      resolve(result);
    }

    function handleConfirm() {
      cleanup(true);
    }

    function handleCancel() {
      cleanup(false);
    }

    confirmButton.addEventListener("click", handleConfirm);

    cancelButton.addEventListener("click", handleCancel);
  });
}
