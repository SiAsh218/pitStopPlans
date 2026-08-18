import { getToken, refreshAccessToken } from "../auth.js";

function buildQueryString(params = {}) {
  return Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
}

async function request(method, url, body = null, params = null, options = {}) {
  const fullUrl =
    params && Object.keys(params).length
      ? `${url}?${buildQueryString(params)}`
      : url;

  const response = await fetch(fullUrl, {
    method,

    // Required so the browser sends authentication cookies.
    credentials: "include",

    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },

    ...(body && {
      body: JSON.stringify(body),
    }),
  });

  /*
   * Access token may have expired.
   *
   * Refresh once and retry the original request.
   */
  if (response.status === 401 && !options._retried) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return request(method, url, body, params, {
        ...options,
        _retried: true,
      });
    }
  }

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }

  return options.raw ? json : json.data;
}

export const api = {
  get(url, params = null, options = {}) {
    return request("GET", url, null, params, options);
  },

  post(url, body) {
    return request("POST", url, body);
  },

  put(url, body) {
    return request("PUT", url, body);
  },

  delete(url) {
    return request("DELETE", url);
  },
};
