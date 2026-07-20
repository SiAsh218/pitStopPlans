export let templateState = {
  version: null,
  incidentType: {},
  incidentRoles: [],
  stages: [],
};

export function clearTemplateState() {
  templateState.version = null;
  templateState.incidentType = {};
  templateState.incidentRoles = [];
  templateState.stages = [];
}
