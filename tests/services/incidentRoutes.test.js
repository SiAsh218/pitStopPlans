jest.mock("../../backend/middleware/auth", () => jest.fn());

const routes = require("../../backend/routes/incidentRoutes");

function findRoute(path) {
  return routes.find((route) => route.method === "POST" && route.path === path);
}

describe("incident route permissions", () => {
  it("allows users to close incidents", () => {
    const route = findRoute("/api/incidents/:id/close");
    const roleCheck = route.handler[1];

    expect(roleCheck({ user: { role: "user" } }, {})).toBe(true);
  });

  it("keeps reopening restricted to admins and editors", () => {
    const route = findRoute("/api/incidents/:id/reopen");
    const roleCheck = route.handler[1];

    expect(() => roleCheck({ user: { role: "user" } }, {})).toThrow(
      "Forbidden",
    );
    expect(roleCheck({ user: { role: "editor" } }, {})).toBe(true);
    expect(roleCheck({ user: { role: "admin" } }, {})).toBe(true);
  });

  it.each(["ccil", "tin"])(
    "allows users to update incident %s metadata",
    (metadata) => {
      const route = findRoute(`/api/incidents/:id/${metadata}`);
      const roleCheck = route.handler[1];

      expect(roleCheck({ user: { role: "user" } }, {})).toBe(true);
    },
  );

  it("keeps general incident metadata restricted to admins and editors", () => {
    const route = findRoute("/api/incidents/:id/meta");
    const roleCheck = route.handler[1];

    expect(() => roleCheck({ user: { role: "user" } }, {})).toThrow(
      "Forbidden",
    );
    expect(roleCheck({ user: { role: "editor" } }, {})).toBe(true);
  });
});
