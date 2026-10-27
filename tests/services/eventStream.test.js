const {
  dispatchMessage,
  readEventStream,
} = require("../../frontend/src/js/services/eventStream.cjs");

function createStream(chunks) {
  let index = 0;
  const reader = {
    read: jest.fn(async () => {
      if (index >= chunks.length) {
        return { done: true };
      }

      return {
        done: false,
        value: new TextEncoder().encode(chunks[index++]),
      };
    }),
    releaseLock: jest.fn(),
  };

  return {
    body: { getReader: () => reader },
    reader,
  };
}

describe("SSE event stream parser", () => {
  it("parses messages split across chunks and dispatches multiple events", async () => {
    const { body, reader } = createStream([
      'data: {"type":"incident-created","incident',
      'Id":7}\n\ndata: {"type":"incident-closed","incidentId":8}\n\n',
    ]);
    const messages = [];

    await readEventStream(body, new AbortController().signal, (message) =>
      messages.push(message),
    );

    expect(messages).toEqual([
      'data: {"type":"incident-created","incidentId":7}',
      'data: {"type":"incident-closed","incidentId":8}',
    ]);
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  it("normalizes CRLF and CR line endings", async () => {
    const { body } = createStream([
      'data: {"type":"incident-created"}\r\n\r\ndata: {"type":"incident-closed"}\r\r',
    ]);
    const messages = [];

    await readEventStream(body, new AbortController().signal, (message) =>
      messages.push(message),
    );

    expect(messages).toEqual([
      'data: {"type":"incident-created"}',
      'data: {"type":"incident-closed"}',
    ]);
  });

  it("releases the reader when the stream is aborted", async () => {
    const controller = new AbortController();
    const { body, reader } = createStream([
      'data: {"type":"incident-created"}\n\n',
      'data: {"type":"incident-closed"}\n\n',
    ]);
    const messages = [];

    await readEventStream(body, controller.signal, (message) => {
      messages.push(message);
      controller.abort();
    });

    expect(messages).toHaveLength(1);
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  it("dispatches JSON data and joins multiple data lines", () => {
    const dispatchEvent = jest.fn();

    dispatchMessage(
      'event: update\ndata: {"type":"incident-action-updated",\ndata: "incidentId":7}',
      dispatchEvent,
    );

    expect(dispatchEvent).toHaveBeenCalledWith(
      "incident-action-updated",
      { type: "incident-action-updated", incidentId: 7 },
    );
  });

  it("ignores comments, empty messages, and payloads without a type", () => {
    const dispatchEvent = jest.fn();

    dispatchMessage(": heartbeat", dispatchEvent);
    dispatchMessage("", dispatchEvent);
    dispatchMessage("data: {}", dispatchEvent);

    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it("reports malformed JSON without throwing", () => {
    const dispatchEvent = jest.fn();
    const onError = jest.fn();

    expect(() =>
      dispatchMessage("data: {invalid}", dispatchEvent, onError),
    ).not.toThrow();

    expect(dispatchEvent).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      "[SSE] Failed to parse message",
      expect.any(SyntaxError),
    );
  });
});
