import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./src/lib/socket";
import { registerSocketHandlers } from "./src/lib/socket-handlers";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: dev ? "*" : undefined,
    },
  });

  setIO(io);
  registerSocketHandlers(io);

  httpServer.listen(port, () => {
    console.log(`> PromptWars running on http://${hostname}:${port}`);
    console.log(`> Socket.io attached`);
    console.log(`> Environment: ${dev ? "development" : "production"}`);
  });
});
