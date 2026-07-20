import { login, isAuthenticated } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  // Not on login page
  if (!loginForm) {
    return;
  }

  // Already logged in
  // if (isAuthenticated()) {
  //   window.location.href = "/";
  //   return;
  // }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);

    try {
      const result = await login(
        formData.get("email"),
        formData.get("password"),
      );

      localStorage.setItem("token", result.token);

      window.location.href = "/";
    } catch (err) {
      alert(err.message);
    }
  });
});
