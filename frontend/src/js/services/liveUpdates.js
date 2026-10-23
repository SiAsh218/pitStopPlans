import { getToken, refreshAccessToken } from "../auth.js";

let streamController = null;
let reconnectDelay = 1000;
let hasConnected = false;

export function initialiseLiveUpdates() {
  if (streamController) {
    return;
  }

  streamController = new AbortController();

  window.addEventListener("pagehide", stopLiveUpdates, { once: true });
  window.addEventListener("pageshow", initialiseLiveUpdates);
  connect(streamController.signal);
}

function stopLiveUpdates() {
  streamController?.abort();
  streamController = null;
}

async function connect(signal) {
  while (!signal.aborted) {
    try {
      let token = getToken();

      if (!token && !(await refreshAccessToken())) {
        window.location.href = "/login";
        return;
      }

      token = getToken();
      const response = await fetch("/events", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "same-origin",
        signal,
      });

      if (response.status === 401) {
        if (!(await refreshAccessToken())) {
          window.location.href = "/login";
          return;
        }
        continue;
      }

      if (!response.ok || !response.body) {
        throw new Error(`SSE connection failed (${response.status})`);
      }

      reconnectDelay = 1000;
      if (hasConnected) {
        dispatchIncidentRefresh("live-update-reconnected");
      }
      hasConnected = true;
      await readEventStream(response.body, signal);
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      console.error("[SSE] Connection interrupted", error);
    }

    if (!signal.aborted) {
      await delay(reconnectDelay, signal);
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    }
  }
}

async function readEventStream(body, signal) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read();

      if (done) {
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

      let separatorIndex;
      while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
        const message = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        dispatchMessage(message);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function dispatchMessage(message) {
  const data = message
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data) {
    return;
  }

  try {
    const payload = JSON.parse(data);
    if (!payload?.type) return;

    window.dispatchEvent(new CustomEvent(payload.type, { detail: payload }));
  } catch (error) {
    console.error("[SSE] Failed to parse message", error);
  }
}

function dispatchIncidentRefresh(type) {
  window.dispatchEvent(new CustomEvent(type));
}

function delay(milliseconds, signal) {
  return new Promise((resolve) => {
    const onAbort = () => {
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      resolve();
    };
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);

    signal.addEventListener("abort", onAbort, { once: true });
  });
}
