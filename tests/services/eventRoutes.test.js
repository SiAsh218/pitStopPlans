jest.mock("../../backend/controllers/eventController", () => ({
  stream: jest.fn(),
}));
jest.mock("../../backend/middleware/auth", () => jest.fn());
jest.mock("../../backend/middleware/role", () => jest.fn(() => jest.fn()));

const auth = require("../../backend/middleware/auth");
const routes = require("../../backend/routes/eventRoutes");

describe("SSE route security", () => {
  it("requires authentication and an application role before opening a stream", () => {
    const eventRoute = routes.find(
      (route) => route.method === "GET" && route.path === "/events",
    );

    expect(eventRoute.handler).toHaveLength(3);
    expect(eventRoute.handler[0]).toBe(auth);
    expect(eventRoute.handler[1]).toEqual(expect.any(Function));
    expect(eventRoute.handler[2]).toEqual(expect.any(Function));
  });
});
