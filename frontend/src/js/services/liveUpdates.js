let events = null;

export function initialiseLiveUpdates() {
  if (events) {
    return;
  }

  events = new EventSource("/events");

  window.addEventListener(
    "beforeunload",
    () => {
      events?.close();
      events = null;
    },
    { once: true },
  );

  events.onopen = () => {
    // console.log("[SSE] Open");
  };

  events.onerror = (err) => {
    console.error("[SSE] Error", err);
  };

  events.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);

      if (!payload?.type) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent(payload.type, {
          detail: payload,
        }),
      );
    } catch (err) {
      console.error("[SSE] Failed to parse message", err);
    }
  };
}
