const { EventEmitter } = require("events");
const eventService = require("../../backend/services/eventService");
const eventController = require("../../backend/controllers/eventController");

function createRequest() {
  return new EventEmitter();
}

function createResponse() {
  const response = new EventEmitter();
  response.destroyed = false;
  response.writable = true;
  response.writeHead = jest.fn();
  response.flushHeaders = jest.fn();
  response.write = jest.fn(() => true);
  response.end = jest.fn();
  response.destroy = jest.fn(() => {
    response.destroyed = true;
  });
  return response;
}

describe("SSE event stream controller", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    eventService.clients.clear();
  });

  afterEach(() => {
    eventService.clients.clear();
    jest.useRealTimers();
  });

  it("opens a stream and sends retry and connected messages", () => {
    const req = createRequest();
    const res = createResponse();

    eventController.stream(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(
      200,
      expect.objectContaining({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      }),
    );
    expect(res.flushHeaders).toHaveBeenCalledTimes(1);
    expect(res.write).toHaveBeenNthCalledWith(1, "retry: 3000\n\n");
    expect(res.write).toHaveBeenNthCalledWith(
      2,
      `data: ${JSON.stringify({ type: "connected" })}\n\n`,
    );
    expect(eventService.clients.has(res)).toBe(true);

    res.emit("close");
    expect(eventService.clients.has(res)).toBe(false);
  });

  it("sends a heartbeat every 30 seconds", () => {
    const req = createRequest();
    const res = createResponse();

    eventController.stream(req, res);
    jest.advanceTimersByTime(30000);

    expect(res.write).toHaveBeenLastCalledWith(": heartbeat\n\n");

    res.emit("close");
  });

  it.each(["destroyed", "unwritable"])(
    "removes a client with a %s response on heartbeat",
    (responseState) => {
      const req = createRequest();
      const res = createResponse();

      eventController.stream(req, res);
      if (responseState === "destroyed") {
        res.destroyed = true;
      } else {
        res.writable = false;
      }

      jest.advanceTimersByTime(30000);

      expect(eventService.clients.has(res)).toBe(false);
      expect(res.destroy).not.toHaveBeenCalled();

      res.emit("close");
    },
  );

  it("destroys and removes a client when a heartbeat cannot be written", () => {
    const req = createRequest();
    const res = createResponse();
    res.write
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(false);

    eventController.stream(req, res);
    jest.advanceTimersByTime(30000);

    expect(res.destroy).toHaveBeenCalledTimes(1);
    expect(eventService.clients.has(res)).toBe(false);

    res.emit("close");
  });

  it.each(["close", "error", "aborted"])(
    "cleans up timers and unregisters a client on %s",
    (event) => {
      const req = createRequest();
      const res = createResponse();

      eventController.stream(req, res);

      if (event === "aborted") {
        req.emit(event);
      } else {
        res.emit(event);
      }

      expect(eventService.clients.has(res)).toBe(false);
      expect(jest.getTimerCount()).toBe(0);

      res.emit("close");
      req.emit("aborted");
      expect(eventService.clients.has(res)).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  it("ends the stream after its five-minute lifetime", () => {
    const req = createRequest();
    const res = createResponse();

    eventController.stream(req, res);
    jest.advanceTimersByTime(5 * 60 * 1000);

    expect(res.end).toHaveBeenCalledTimes(1);

    res.emit("close");
    expect(eventService.clients.has(res)).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });
});
