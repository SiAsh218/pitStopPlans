import { showError, showSuccess } from "./utils/myAlert.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("change-password-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrfToken="))
        ?.split("=")[1];

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
            ? decodeURIComponent(csrfToken)
            : "",
        },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: formData.get("newPassword"),
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Unable to change password");
      }

      localStorage.removeItem("user");
      showSuccess(json.data?.message || "Password changed successfully");

      window.setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (error) {
      showError(error.message || "Unable to change password");
    }
  });
});
