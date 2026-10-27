async function readEventStream(body, signal, onMessage) {
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
        onMessage(message);
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function dispatchMessage(message, dispatchEvent, onError = console.error) {
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

    dispatchEvent(payload.type, payload);
  } catch (error) {
    onError("[SSE] Failed to parse message", error);
  }
}

module.exports = {
  dispatchMessage,
  readEventStream,
};
