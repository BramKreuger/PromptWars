import { createServer, IncomingMessage, ServerResponse } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./src/lib/socket";
import { registerSocketHandlers } from "./src/lib/socket-handlers";
import { createGame } from "./src/lib/engine";
import { getGame } from "./src/lib/store";

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/** Read the full request body as a string. */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

/** Send a JSON response. */
function json(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

app.prepare().then(() => {
  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || "";

    // --- Handle game API routes in-process so they share the store with Socket.io ---

    // POST /api/games — create a new game
    if (url === "/api/games" && req.method === "POST") {
      try {
        const body = JSON.parse(await readBody(req));

        if (!body.scenario?.trim()) {
          return json(res, 400, { error: "Scenario description is required" });
        }

        const game = await createGame({
          scenario: body.scenario,
          playerCount: Math.min(Math.max(body.playerCount || 4, 2), 8),
          rounds: Math.min(Math.max(body.rounds || 5, 3), 10),
          promptTime: Math.min(Math.max(body.promptTime || 90, 30), 300),
        });

        return json(res, 200, { gameId: game.id, game });
      } catch (error) {
        console.error("Failed to create game:", error);
        return json(res, 500, { error: "Failed to create game" });
      }
    }

    // GET /api/games/<gameId> — fetch game state
    const getMatch = url.match(/^\/api\/games\/([^/]+)$/);
    if (getMatch && req.method === "GET") {
      const game = getGame(getMatch[1]);
      if (!game) {
        return json(res, 404, { error: "Game not found" });
      }
      return json(res, 200, { game });
    }

    // --- Everything else: delegate to Next.js ---
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
