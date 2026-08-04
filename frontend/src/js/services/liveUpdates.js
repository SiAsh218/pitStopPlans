let connectionCount = 0;

export function initialiseLiveUpdates() {
  connectionCount++;

  // console.log("[SSE] Initialising connection", connectionCount);

  const events = new EventSource("/events");

  events.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    window.dispatchEvent(
      new CustomEvent(payload.type, {
        detail: payload,
      }),
    );
  };
}
