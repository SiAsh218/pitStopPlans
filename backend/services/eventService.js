class EventService {
  constructor() {
    this.clients = new Set();
  }

  addClient(res) {
    this.clients.add(res);

    console.log(`[SSE] Client connected (${this.clients.size} total)`);
  }

  removeClient(res) {
    this.clients.delete(res);

    console.log(`[SSE] Client disconnected (${this.clients.size} total)`);
  }

  broadcast(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }

    console.log(
      `[SSE] Broadcast: ${event.type} -> ${this.clients.size} clients`,
    );
  }
}

module.exports = new EventService();
