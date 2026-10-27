const {
  registerDashboardLiveUpdates,
  registerIncidentLiveUpdates,
} = require("../../frontend/src/js/services/liveUpdateSubscriptions.cjs");

function createEventTarget() {
  const listeners = new Map();

  return {
    addEventListener(type, listener) {
      const eventListeners = listeners.get(type) || [];
      eventListeners.push(listener);
      listeners.set(type, eventListeners);
    },
    dispatch(type, detail) {
      for (const listener of listeners.get(type) || []) {
        listener({ detail });
      }
    },
  };
}

describe("live update page subscriptions", () => {
  it("refreshes the dashboard for incident changes and reconnections", () => {
    const eventTarget = createEventTarget();
    const loadIncidents = jest.fn();
    registerDashboardLiveUpdates(eventTarget, loadIncidents);

    eventTarget.dispatch("incident-created");
    eventTarget.dispatch("incident-closed", { incidentId: 12 });
    eventTarget.dispatch("incident-reopened", { incidentId: 12 });
    eventTarget.dispatch("incident-action-updated", { incidentId: 12 });
    eventTarget.dispatch("incident-action-assigned", { incidentId: 12 });
    eventTarget.dispatch("incident-meta-updated", { incidentId: 12 });
    eventTarget.dispatch("live-update-reconnected");
    eventTarget.dispatch("incident-action-updated");
    eventTarget.dispatch("unrelated-event", { incidentId: 12 });

    expect(loadIncidents).toHaveBeenCalledTimes(7);
  });

  it("refreshes only the matching incident and refreshes after reconnect", () => {
    const eventTarget = createEventTarget();
    const refreshIncidentPage = jest.fn();
    registerIncidentLiveUpdates(
      eventTarget,
      () => "42",
      refreshIncidentPage,
    );

    eventTarget.dispatch("incident-action-updated", { incidentId: 41 });
    eventTarget.dispatch("incident-action-assigned", { incidentId: 42 });
    eventTarget.dispatch("incident-closed", { incidentId: 42 });
    eventTarget.dispatch("incident-reopened", { incidentId: 42 });
    eventTarget.dispatch("incident-ccil-updated", { incidentId: 42 });
    eventTarget.dispatch("incident-tin-updated", { incidentId: 42 });
    eventTarget.dispatch("incident-meta-updated", { incidentId: 42 });
    eventTarget.dispatch("live-update-reconnected");
    eventTarget.dispatch("incident-action-updated");

    expect(refreshIncidentPage).toHaveBeenCalledTimes(7);
  });
});
