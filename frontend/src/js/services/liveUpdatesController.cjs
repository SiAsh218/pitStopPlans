function createLiveUpdates({
  eventTarget,
  getToken,
  refreshAccessToken,
  fetch,
  dispatchEvent,
  redirect,
  readEventStream,
  onError = console.error,
  createAbortController = () => new AbortController(),
  delay = defaultDelay,
  now = Date.now,
  random = Math.random,
}) {
  const stableConnectionDuration = 30000;
  let streamController = null;
  let reconnectDelay = 1000;
  let hasConnected = false;
  let listenersRegistered = false;

  function initialiseLiveUpdates() {
    if (!listenersRegistered) {
      eventTarget.addEventListener("pagehide", stopLiveUpdates);
      eventTarget.addEventListener("pageshow", initialiseLiveUpdates);
      listenersRegistered = true;
    }

    if (streamController) {
      return;
    }

    streamController = createAbortController();
    connect(streamController.signal);
  }

  function stopLiveUpdates() {
    streamController?.abort();
    streamController = null;
  }

  async function connect(signal) {
    while (!signal.aborted) {
      let connectionStartedAt = null;

      try {
        let token = getToken();

        if (!token && !(await refreshAccessToken())) {
          redirect("/login");
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
            redirect("/login");
            return;
          }
          continue;
        }

        if (!response.ok || !response.body) {
          throw new Error(`SSE connection failed (${response.status})`);
        }

        connectionStartedAt = now();
        if (hasConnected) {
          dispatchEvent("live-update-reconnected");
        }
        hasConnected = true;

        await readEventStream(response.body, signal, (message) => {
          dispatchEvent(message.type, message);
        });
      } catch (error) {
        if (signal.aborted) {
          return;
        }

        onError("[SSE] Connection interrupted", error);
      }

      if (!signal.aborted) {
        if (
          connectionStartedAt !== null &&
          now() - connectionStartedAt >= stableConnectionDuration
        ) {
          reconnectDelay = 1000;
        }

        const jitteredDelay = Math.round(
          reconnectDelay * (0.8 + random() * 0.4),
        );
        await delay(jitteredDelay, signal);
        if (!signal.aborted) {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        }
      }
    }
  }

  return {
    initialiseLiveUpdates,
    stopLiveUpdates,
  };
}

function defaultDelay(milliseconds, signal) {
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

module.exports = {
  createLiveUpdates,
};
