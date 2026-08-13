const eventService = require("../services/eventService");

let clientCount = 0;

function stream(req, res) {
  const clientId = ++clientCount;

  console.log(`[SSE] Client ${clientId} connected`);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  res.write(
    `data: ${JSON.stringify({
      type: "connected",
    })}\n\n`,
  );

  const heartbeat = setInterval(() => {
    console.log(`[SSE] Heartbeat -> ${clientId}`);
    res.write(": heartbeat\n\n");
  }, 30000);

  eventService.addClient(res);

  req.on("close", () => {
    console.log(`[SSE] Client ${clientId} disconnected`);

    clearInterval(heartbeat);
    eventService.removeClient(res);
  });
}

module.exports = {
  stream,
};
