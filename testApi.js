const BASE_URL = "http://localhost:3000";

const EMAIL = "admin@test.com";
const PASSWORD = "admin123";

let token;
let incidentId;
let actionId;

async function request(method, path, body = null) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },

    ...(body
      ? {
          body: JSON.stringify(body),
        }
      : {}),
  });

  const json = await response.json();

  console.log(`\n${method} ${path}`);

  console.log(JSON.stringify(json, null, 2));

  if (!response.ok) {
    throw new Error(`${method} ${path} failed`);
  }

  return json;
}

async function run() {
  console.log("\n=== LOGIN ===");

  const login = await request("POST", "/api/auth/login", {
    email: EMAIL,
    password: PASSWORD,
  });

  token = login.data.token;

  console.log("\n=== CREATE INCIDENT ===");

  const incident = await request("POST", "/api/incidents", {
    incident_type_id: 1,
    title: "API Smoke Test Incident",
    description: "Created by automated test",
  });

  incidentId = incident.data.id;

  console.log(`Incident ID: ${incidentId}`);

  console.log("\n=== INCIDENT DETAILS ===");

  await request("GET", `/api/incidents/${incidentId}`);

  console.log("\n=== INCIDENT DASHBOARD ===");

  const dashboard = await request(
    "GET",
    `/api/incidents/${incidentId}/dashboard`,
  );

  if (!dashboard.data.actions || dashboard.data.actions.length === 0) {
    throw new Error("No incident actions created");
  }

  actionId = dashboard.data.actions[0].id;

  console.log(`Action ID: ${actionId}`);

  console.log("\n=== GET ACTION ===");

  await request("GET", `/api/incident_actions/${actionId}`);

  console.log("\n=== START ACTION ===");

  await request("POST", `/api/incident_actions/${actionId}/start`);

  console.log("\n=== ADD COMMENT ===");

  await request("POST", `/api/incident_actions/${actionId}/updates`, {
    note: "Action started successfully",
  });

  console.log("\n=== COMPLETE ACTION ===");

  await request("POST", `/api/incident_actions/${actionId}/complete`);

  console.log("\n=== GET ACTION HISTORY ===");

  await request("GET", `/api/incident_actions/${actionId}/updates`);

  console.log("\n=== CLOSE INCIDENT ===");

  await request("POST", `/api/incidents/${incidentId}/close`);

  console.log("\n=== FINAL DASHBOARD ===");

  await request("GET", `/api/incidents/${incidentId}/dashboard`);

  console.log("\n✅ ALL TESTS PASSED");
}

run().catch((err) => {
  console.error("\n❌ TEST FAILED");

  console.error(err);

  process.exit(1);
});
