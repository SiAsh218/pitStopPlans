import { getToken } from "../auth.js";

async function request(method, url, body = null) {
  const response = await fetch(url, {
    method,

    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },

    ...(body && {
      body: JSON.stringify(body),
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json.data;
}

export const api = {
  get(url) {
    return request("GET", url);
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
