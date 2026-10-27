import { getToken, refreshAccessToken } from "../auth.js";
import eventStream from "./eventStream.cjs";
import liveUpdatesController from "./liveUpdatesController.cjs";

const liveUpdates = liveUpdatesController.createLiveUpdates({
  eventTarget: window,
  getToken,
  refreshAccessToken,
  fetch: (...args) => fetch(...args),
  dispatchEvent: (type, payload) => {
    const options = payload ? { detail: payload } : undefined;
    window.dispatchEvent(new CustomEvent(type, options));
  },
  redirect: (url) => {
    window.location.href = url;
  },
  readEventStream: (body, signal, onMessage) =>
    eventStream.readEventStream(body, signal, (message) => {
      eventStream.dispatchMessage(message, (type, payload) => {
        onMessage({ type, ...payload });
      });
    }),
});

export const initialiseLiveUpdates = liveUpdates.initialiseLiveUpdates;
