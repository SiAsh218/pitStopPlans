const {
  createLiveUpdates,
} = require("../../frontend/src/js/services/liveUpdatesController.cjs");

function createEventTarget() {
  const listeners = new Map();

  return {
    addEventListener: jest.fn((type, listener) => {
      const eventListeners = listeners.get(type) || new Set();
      eventListeners.add(listener);
      listeners.set(type, eventListeners);
    }),
    dispatch(type) {
      for (const listener of listeners.get(type) || []) {
        listener();
      }
    },
    listenerCount(type) {
      return listeners.get(type)?.size || 0;
    },
  };
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function createHarness(overrides = {}) {
  const eventTarget = createEventTarget();
  const fetchCalls = [];
  const dispatchedEvents = [];
  const refreshAccessToken = jest.fn(async () => true);
  const delayCalls = [];
  const delayWaiters = [];
  const readEventStream = jest.fn();
  const fetch = jest.fn((url, options) => {
    fetchCalls.push({ url, options });

    return new Promise((resolve, reject) => {
      const abort = () => reject(new Error("Aborted"));
      options.signal.addEventListener("abort", abort, { once: true });
    });
  });
  const delay = jest.fn((milliseconds) => {
    const deferred = createDeferred();
    delayCalls.push(milliseconds);
    delayWaiters.push(deferred);
    return deferred.promise;
  });
  const dependencies = {
    eventTarget,
    getToken: jest.fn(() => "access-token"),
    refreshAccessToken,
    fetch,
    dispatchEvent: (...args) => dispatchedEvents.push(args),
    redirect: jest.fn(),
    readEventStream,
    onError: jest.fn(),
    delay,
    random: () => 0.5,
    ...overrides,
  };
  const controller = createLiveUpdates(dependencies);

  return {
    controller,
    eventTarget,
    fetch: dependencies.fetch,
    fetchCalls,
    dispatchedEvents,
    refreshAccessToken: dependencies.refreshAccessToken,
    delay: dependencies.delay,
    delayCalls,
    delayWaiters,
    readEventStream,
  };
}

describe("browser live update connection", () => {
  it("registers lifecycle listeners once across repeated page restores", () => {
    const harness = createHarness();

    harness.controller.initialiseLiveUpdates();
    expect(harness.fetch).toHaveBeenCalledTimes(1);
    expect(harness.eventTarget.listenerCount("pagehide")).toBe(1);
    expect(harness.eventTarget.listenerCount("pageshow")).toBe(1);
    expect(harness.eventTarget.addEventListener).toHaveBeenCalledTimes(2);

    harness.eventTarget.dispatch("pagehide");
    harness.eventTarget.dispatch("pageshow");
    expect(harness.fetch).toHaveBeenCalledTimes(2);

    harness.eventTarget.dispatch("pagehide");
    harness.eventTarget.dispatch("pageshow");
    expect(harness.fetch).toHaveBeenCalledTimes(3);
    expect(harness.eventTarget.listenerCount("pagehide")).toBe(1);
    expect(harness.eventTarget.listenerCount("pageshow")).toBe(1);
    expect(harness.eventTarget.addEventListener).toHaveBeenCalledTimes(2);

    harness.controller.stopLiveUpdates();
  });

  it("backs off after a dropped stream and signals when it reconnects", async () => {
    const streamRead = createDeferred();
    const retryDelay = createDeferred();
    const pendingFetch = createDeferred();
    let requestCount = 0;
    const harness = createHarness({
      fetch: jest.fn(() => {
        requestCount += 1;
        return Promise.resolve({
          status: 200,
          ok: true,
          body: { request: requestCount },
        });
      }),
      readEventStream: jest.fn((body) => {
        if (body.request === 1) {
          return streamRead.promise;
        }
        return pendingFetch.promise;
      }),
      delay: jest.fn((milliseconds) => {
        expect(milliseconds).toBe(1000);
        return retryDelay.promise;
      }),
    });
    const streamError = new Error("Connection dropped");

    harness.controller.initialiseLiveUpdates();
    await Promise.resolve();
    await Promise.resolve();

    streamRead.reject(streamError);
    await Promise.resolve();
    await Promise.resolve();

    expect(harness.delay).toHaveBeenCalledWith(
      1000,
      expect.any(AbortSignal),
    );

    retryDelay.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(harness.fetch).toHaveBeenCalledTimes(2);
    expect(harness.dispatchedEvents).toContainEqual([
      "live-update-reconnected",
      undefined,
    ]);

    harness.controller.stopLiveUpdates();
  });

  it("backs off across short-lived streams and resets after a stable connection", async () => {
    let currentTime = 0;
    let streamCount = 0;
    const retryWaiters = [];
    const harnessDelayCalls = [];
    const harness = createHarness({
      fetch: jest.fn(async () => ({
        status: 200,
        ok: true,
        body: {},
      })),
      readEventStream: jest.fn(async () => {
        streamCount += 1;
        if (streamCount === 3) {
          currentTime += 30000;
        }
        throw new Error("Connection dropped");
      }),
      delay: jest.fn((milliseconds) => {
        const deferred = createDeferred();
        harnessDelayCalls.push(milliseconds);
        retryWaiters.push(deferred);
        return deferred.promise;
      }),
      now: () => currentTime,
    });

    harness.controller.initialiseLiveUpdates();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(harnessDelayCalls).toEqual([1000]);
    retryWaiters[0].resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(harnessDelayCalls).toEqual([1000, 2000]);
    retryWaiters[1].resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(harnessDelayCalls).toEqual([1000, 2000, 1000]);

    harness.controller.stopLiveUpdates();
  });

  it("refreshes the token and retries immediately after a 401 response", async () => {
    let token = "expired-token";
    let requestNumber = 0;
    const requestSignals = [];
    const harness = createHarness({
      getToken: jest.fn(() => token),
      refreshAccessToken: jest.fn(async () => {
        token = "refreshed-token";
        return true;
      }),
      fetch: jest.fn((url, options) => {
        requestNumber += 1;
        requestSignals.push(options.signal);
        if (requestNumber === 1) {
          return Promise.resolve({ status: 401 });
        }
        return new Promise((resolve, reject) => {
          options.signal.addEventListener(
            "abort",
            () => reject(new Error("Aborted")),
            { once: true },
          );
        });
      }),
    });

    harness.controller.initialiseLiveUpdates();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(harness.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(harness.fetch).toHaveBeenCalledTimes(2);
    expect(harness.fetch.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer expired-token",
    );
    expect(harness.fetch.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer refreshed-token",
    );
    expect(harness.delay).not.toHaveBeenCalled();

    harness.controller.stopLiveUpdates();
  });

  it("redirects to login when a missing token cannot be refreshed", async () => {
    const redirect = jest.fn();
    const fetch = jest.fn();
    const harness = createHarness({
      getToken: jest.fn(() => null),
      refreshAccessToken: jest.fn(async () => false),
      fetch,
      redirect,
    });

    harness.controller.initialiseLiveUpdates();
    await Promise.resolve();
    await Promise.resolve();

    expect(harness.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login");

    harness.controller.stopLiveUpdates();
  });
});
