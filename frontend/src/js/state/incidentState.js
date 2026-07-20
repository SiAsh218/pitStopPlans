export let incidentState = {
  selectedIncident: null,
  dashboard: null,
};

export function setSelectedIncident(incident) {
  incidentState.selectedIncident = incident;
}

export function setDashboard(dashboard) {
  incidentState.dashboard = dashboard;
}

export function clearIncidentState() {
  incidentState.selectedIncident = null;

  incidentState.dashboard = null;
}
