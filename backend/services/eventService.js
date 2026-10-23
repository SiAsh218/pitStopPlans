const ALLOWED_EVENT_TYPES = new Set([
  "incident-created",
  "incident-closed",
  "incident-reopened",
  "incident-action-updated",
  "incident-action-assigned",
  "incident-ccil-updated",
  "incident-tin-updated",
  "incident-meta-updated",
]);

class EventService {
  constructor() {
    this.clients = new Set();
  }

  addClient(res) {
    this.clients.add(res);

    console.log(`[SSE] Client connected (${this.clients.size} total)`);
  }

  removeClient(res) {
    if (this.clients.delete(res)) {
      console.log(`[SSE] Client disconnected (${this.clients.size} total)`);
    }
  }

  broadcast(event) {
    const safeEvent = {
      type: event?.type,
      incidentId: Number(event?.incidentId),
    };

    if (
      typeof safeEvent.type !== "string" ||
      !ALLOWED_EVENT_TYPES.has(safeEvent.type) ||
      !Number.isSafeInteger(safeEvent.incidentId) ||
      safeEvent.incidentId < 1
    ) {
      return;
    }

    const payload = `data: ${JSON.stringify(safeEvent)}\n\n`;

    for (const client of this.clients) {
      try {
        if (client.destroyed || !client.writable || !client.write(payload)) {
          this.removeClient(client);
          client.destroy?.();
        }
      } catch {
        this.removeClient(client);
      }
    }
  }
}

module.exports = new EventService();
