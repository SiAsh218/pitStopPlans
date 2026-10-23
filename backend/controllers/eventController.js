const eventService = require("../services/eventService");

let clientCount = 0;

function stream(req, res) {
  const clientId = ++clientCount;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  res.write("retry: 3000\n\n");
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
    })}\n\n`,
  );

  const heartbeat = setInterval(() => {
    if (res.destroyed || !res.writable) {
      clearInterval(heartbeat);
      eventService.removeClient(res);
      return;
    }

    if (!res.write(": heartbeat\n\n")) {
      clearInterval(heartbeat);
      eventService.removeClient(res);
      res.destroy();
    }
  }, 30000);

  const connectionLifetime = setTimeout(() => {
    res.end();
  }, 5 * 60 * 1000);

  eventService.addClient(res);

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(heartbeat);
    clearTimeout(connectionLifetime);
    eventService.removeClient(res);
  };

  res.on("close", cleanup);
  res.on("error", cleanup);
  req.on("aborted", cleanup);
}

module.exports = {
  stream,
};
