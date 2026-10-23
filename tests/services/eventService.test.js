const eventService = require("../../backend/services/eventService");

describe("EventService", () => {
  beforeEach(() => {
    eventService.clients.clear();
  });

  afterAll(() => {
    eventService.clients.clear();
  });

  it("broadcasts only the allowlisted incident notification fields", () => {
    const client = {
      writable: true,
      write: jest.fn(() => true),
    };
    eventService.addClient(client);

    eventService.broadcast({
      type: "incident-action-updated",
      incidentId: 15,
      incident: { title: "Sensitive incident data" },
      stats: { openWorkload: 99 },
      userId: 42,
      actionId: 123,
    });

    expect(client.write).toHaveBeenCalledWith(
      `data: ${JSON.stringify({
        type: "incident-action-updated",
        incidentId: 15,
      })}\n\n`,
    );
  });

  it("ignores events without a valid incident id", () => {
    const client = {
      writable: true,
      write: jest.fn(() => true),
    };
    eventService.addClient(client);

    eventService.broadcast({ type: "incident-created" });

    expect(client.write).not.toHaveBeenCalled();
  });

  it("ignores event types outside the application notification set", () => {
    const client = {
      writable: true,
      write: jest.fn(() => true),
    };
    eventService.addClient(client);

    eventService.broadcast({ type: "debug-dump", incidentId: 15 });

    expect(client.write).not.toHaveBeenCalled();
  });

  it("removes and destroys clients that cannot keep up", () => {
    const client = {
      writable: true,
      write: jest.fn(() => false),
      destroy: jest.fn(),
    };
    eventService.addClient(client);

    eventService.broadcast({
      type: "incident-created",
      incidentId: 15,
    });

    expect(client.destroy).toHaveBeenCalledTimes(1);
    expect(eventService.clients.has(client)).toBe(false);
  });
});
