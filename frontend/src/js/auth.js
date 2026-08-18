let refreshPromise = null;

export async function login(email, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
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

  const { accessToken, user } = json.data;

  if (!accessToken || !user) {
    throw new Error("Invalid login response");
  }

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));

  return {
    accessToken,
    user,
  };
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

export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Logout failed:", err);
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  window.location.href = "/login";
}

export function getToken() {
  return localStorage.getItem("accessToken");
}

export async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      if (!response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        return false;
      }

      const { accessToken, user } = json.data || {};

      if (!accessToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        return false;
      }

      localStorage.setItem("accessToken", accessToken);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return true;
    } catch (err) {
      console.error("Token refresh failed:", err);

      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function isAuthenticated() {
  const token = getToken();

  if (!token) {
    return await refreshAccessToken();
  }

  try {
    const response = await fetch("/api/auth/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return true;
    }

    /*
     * The access token may have expired.
     *
     * Try the refresh token before deciding
     * that the user is no longer authenticated.
     */
    if (response.status === 401) {
      return await refreshAccessToken();
    }

    return false;
  } catch (err) {
    console.error("Authentication validation failed:", err);

    return await refreshAccessToken();
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return null;
  }

  return JSON.parse(user);
}
