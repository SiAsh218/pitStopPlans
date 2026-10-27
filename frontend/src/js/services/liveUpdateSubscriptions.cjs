const DASHBOARD_EVENT_TYPES = [
  "incident-closed",
  "incident-reopened",
  "incident-action-updated",
  "incident-action-assigned",
  "incident-meta-updated",
];

const INCIDENT_EVENT_TYPES = [
  "incident-action-updated",
  "incident-action-assigned",
  "incident-closed",
  "incident-reopened",
  "incident-ccil-updated",
  "incident-tin-updated",
  "incident-meta-updated",
];

function registerDashboardLiveUpdates(eventTarget, loadIncidents) {
  const refreshForIncident = (event) => {
    if (event.detail?.incidentId) {
      loadIncidents();
    }
  };

  eventTarget.addEventListener("incident-created", loadIncidents);

  for (const type of DASHBOARD_EVENT_TYPES) {
    eventTarget.addEventListener(type, refreshForIncident);
  }

  eventTarget.addEventListener("live-update-reconnected", loadIncidents);
}

function registerIncidentLiveUpdates(
  eventTarget,
  getIncidentId,
  refreshIncidentPage,
) {
  const refreshForCurrentIncident = (event) => {
    const currentIncidentId = Number(getIncidentId());

    if (
      !Number.isSafeInteger(currentIncidentId) ||
      Number(event.detail?.incidentId) !== currentIncidentId
    ) {
      return;
    }

    refreshIncidentPage();
  };

  for (const type of INCIDENT_EVENT_TYPES) {
    eventTarget.addEventListener(type, refreshForCurrentIncident);
  }

  eventTarget.addEventListener(
    "live-update-reconnected",
    refreshIncidentPage,
  );
}

module.exports = {
  registerDashboardLiveUpdates,
  registerIncidentLiveUpdates,
};
