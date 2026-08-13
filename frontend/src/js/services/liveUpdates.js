let events = null;

export function initialiseLiveUpdates() {
  if (events) {
    return;
  }

  events = new EventSource("/events");

  window.addEventListener("beforeunload", () => {
    console.log("[SSE] Closing connection");

    events?.close();
    events = null;
  });

  events.onopen = () => {
    console.log("[SSE] Open");
  };

  events.onerror = (err) => {
    console.error("[SSE] Error", err);
  };

  events.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    window.dispatchEvent(
      new CustomEvent(payload.type, {
        detail: payload,
      }),
    );
  };
}
