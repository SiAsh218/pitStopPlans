export function initialiseLiveUpdates() {
  const events = new EventSource("/events");

  console.log("[SSE] Initialising");

  events.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    console.log("[SSE] Received:", payload);

    window.dispatchEvent(
      new CustomEvent(payload.type, {
        detail: payload,
      }),
    );
  };

  events.onerror = (err) => {
    console.error("[SSE] Error:", err);
  };
}
