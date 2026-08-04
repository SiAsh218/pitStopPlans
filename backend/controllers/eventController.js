const eventService = require("../services/eventService");

function stream(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Initial connection success message
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
    })}\n\n`,
  );

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  eventService.addClient(res);

  req.on("close", () => {
    clearInterval(heartbeat);
    eventService.removeClient(res);
  });
}

module.exports = {
  stream,
};
