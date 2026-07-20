export async function login(email, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || "Login failed");
  }

  return json.data;
}

export async function requireAuth() {
  const isLoginPage = window.location.pathname === "/login";

  if (isLoginPage) {
    return true;
  }

  if (!(await isAuthenticated())) {
    window.location.href = "/login";
    return false;
  }

  return true;
}

export function logout() {
  localStorage.removeItem("token");

  window.location.href = "/login";
}

export function getToken() {
  return localStorage.getItem("token");
}

// export function isAuthenticated() {
//   return !!getToken();
// }

export async function isAuthenticated() {
  const token = getToken();

  if (!token) {
    return false;
  }

  try {
    const response = await fetch("/api/auth/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);

    localStorage.removeItem("token");

    return false;
  }
}
