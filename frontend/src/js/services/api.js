import { getToken, refreshAccessToken } from "../auth.js";

let templateRevision = null;

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

  const isTemplateMutation =
    method !== "GET" &&
    (/^\/api\/plan_templates\/\d+(?:\/(?:approve|retire|stages\/reorder))?$/.test(
      url,
    ) ||
      /^\/api\/plan_stages(?:\/\d+)?(?:\/actions\/reorder)?$/.test(url) ||
      /^\/api\/plan_stage_actions(?:\/\d+)?$/.test(url));
  const headers = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  if (isTemplateMutation && templateRevision !== null) {
    headers["If-Match"] = String(templateRevision);
  }

  const response = await fetch(fullUrl, {
    method,

    // Required so the browser sends authentication cookies.
    credentials: "include",

    headers,

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

  const receivedTemplateRevision = Number(json.data?.revision);

  if (
    method === "GET" &&
    /^\/api\/plan_templates\/\d+$/.test(url) &&
    Number.isSafeInteger(receivedTemplateRevision) &&
    receivedTemplateRevision >= 1
  ) {
    templateRevision = receivedTemplateRevision;
  } else if (isTemplateMutation && templateRevision !== null) {
    templateRevision += 1;
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
