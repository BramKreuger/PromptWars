import type { Server, Socket } from "socket.io";
import type { GameState, Role } from "./types";
import { SocketEvents } from "./socket-events";
import { getGame, getActiveGame, setGame } from "./store";
import { advanceToPrompting, resolveRound, scoreGame, setBroadcastCallback } from "./engine";
import { startTimer, clearTimer, pauseTimer, resumeTimer } from "./timer";

/** Strip private data from game state for a specific viewer. */
function sanitizeForRole(game: GameState, viewerRoleId: string): GameState {
  const isGM = viewerRoleId === "1";
  const isGameView = viewerRoleId === "0";

  return {
    ...game,
    roles: game.roles.map((role) => {
      const isOwn = role.id === viewerRoleId;
      return {
        ...role,
        // Only show own prompt to the player, or all to GM
        currentPrompt: isGM || isOwn ? role.currentPrompt : null,
        promptHistory: isGM || isOwn ? role.promptHistory : [],
        // Only show own goal/secret to the player, or all to GM. Reveal all when finished.
        goal: isGM || isOwn || game.phase === "finished" ? role.goal : "[Hidden]",
        secret:
          isGM || isOwn || game.phase === "finished" ? role.secret : null,
        // Goal progress only visible to own player and GM
        goalProgress: isGM || isOwn ? role.goalProgress : null,
        // Spectators and other players don't see score justification until finished
        scoreJustification:
          game.phase === "finished" || isGM
            ? role.scoreJustification
            : null,
      };
    }),
    // Strip promptUsed from actions unless GM or own action
    rounds: game.rounds.map((round) => ({
      ...round,
      actions: round.actions.map((action) => ({
        ...action,
        promptUsed:
          isGM || action.roleId === viewerRoleId
            ? action.promptUsed
            : "[Hidden]",
      })),
    })),
  };
}

function broadcastGameState(io: Server, gameId: string): void {
  const game = getGame(gameId);
  if (!game) return;

  const room = io.sockets.adapter.rooms.get(`game:${gameId}`);
  if (!room) return;

  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) continue;
    const roleId = (socket.data as { roleId?: string }).roleId || "spectator";
    socket.emit(SocketEvents.GAME_STATE_UPDATE, sanitizeForRole(game, roleId));
  }
}

async function handleAdvance(io: Server, gameId: string): Promise<void> {
  const game = getGame(gameId);
  if (!game || game.paused) return;

  try {
    if (game.phase === "lobby" || game.phase === "summary") {
      // Check if this was the last round
      if (
        game.phase === "summary" &&
        game.currentRound >= game.settings.rounds
      ) {
        await scoreGame(gameId);
        broadcastGameState(io, gameId);
        return;
      }

      await advanceToPrompting(gameId);
      broadcastGameState(io, gameId);

      // Start the timer for prompt editing
      const updatedGame = getGame(gameId)!;
      if (updatedGame.settings.countdownEnabled) {
        startTimer(gameId, updatedGame.settings.promptTime, () => {
          handleResolve(io, gameId);
        });
      }
    } else if (game.phase === "prompting") {
      clearTimer(gameId);
      await handleResolve(io, gameId);
    }
  } catch (err) {
    console.error(`Error advancing game ${gameId}:`, err);
    io.to(`game:${gameId}`).emit(SocketEvents.ERROR, {
      message: "Failed to advance game",
    });
  }
}

async function handleResolve(io: Server, gameId: string): Promise<void> {
  // Broadcast phase change to resolving
  const game = getGame(gameId);
  if (!game) return;

  game.phase = "resolving";
  setGame(game);
  broadcastGameState(io, gameId);

  await resolveRound(gameId, (action, roleName) => {
    io.to(`game:${gameId}`).emit(SocketEvents.ACTION_RESOLVED, {
      action,
      roleName,
    });
    broadcastGameState(io, gameId);
  });

  broadcastGameState(io, gameId);
}

export function registerSocketHandlers(io: Server): void {
  // Allow engine to broadcast state updates (e.g. when images arrive)
  setBroadcastCallback((gameId: string) => {
    broadcastGameState(io, gameId);
  });

  io.on("connection", (socket: Socket) => {
    const { gameId: queryGameId, roleId } = socket.handshake.query as {
      gameId?: string;
      roleId?: string;
    };

    // Auto-find the active game if no gameId provided
    const game = queryGameId ? getGame(queryGameId) : getActiveGame();
    if (!game) {
      socket.emit(SocketEvents.ERROR, { message: "No active game found" });
      socket.disconnect();
      return;
    }
    const gameId = game.id;

    // Store role info on socket (default to game view if no roleId)
    socket.data = { gameId, roleId: roleId || "0" };

    // Join game room
    socket.join(`game:${gameId}`);

    // Mark player as connected (players are roleId >= 2)
    const roleNum = parseInt(roleId || "0", 10);
    if (roleNum >= 2) {
      const role = game.roles.find((r) => r.id === roleId);
      if (role) {
        role.playerConnected = true;
        setGame(game);
      }
    }

    // Send initial state
    const viewerRole = roleId || "0";
    socket.emit(
      SocketEvents.GAME_STATE_UPDATE,
      sanitizeForRole(game, viewerRole),
    );
    broadcastGameState(io, gameId);

    // --- Client events ---

    socket.on(SocketEvents.SUBMIT_PROMPT, ({ prompt }: { prompt: string }) => {
      const g = getGame(gameId);
      if (!g || g.phase !== "prompting") return;

      const r = g.roles.find((role) => role.id === roleId);
      if (!r) return;

      r.currentPrompt = prompt;
      setGame(g);

      // Notify GM that a prompt was submitted
      broadcastGameState(io, gameId);
    });

    socket.on(SocketEvents.GM_ADVANCE, () => {
      if (roleId !== "1") return; // Only GM
      handleAdvance(io, gameId);
    });

    socket.on(SocketEvents.GM_PAUSE, () => {
      if (roleId !== "1") return;
      const g = getGame(gameId);
      if (!g) return;
      g.paused = true;
      setGame(g);
      pauseTimer(gameId);
      broadcastGameState(io, gameId);
    });

    socket.on(SocketEvents.GM_RESUME, () => {
      if (roleId !== "1") return;
      const g = getGame(gameId);
      if (!g) return;
      g.paused = false;
      setGame(g);
      resumeTimer(gameId);
      broadcastGameState(io, gameId);
    });

    socket.on(
      SocketEvents.GM_EDIT_WORLD_EVENT,
      ({ text }: { text: string }) => {
        if (roleId !== "1") return;
        const g = getGame(gameId);
        if (!g) return;
        const round = g.rounds[g.currentRound - 1];
        if (round?.worldEvent) {
          round.worldEvent.text = text;
          round.worldEvent.injectedBy = "gamemaster";
          setGame(g);
          broadcastGameState(io, gameId);
        }
      },
    );

    socket.on(SocketEvents.GM_SKIP_WORLD_EVENT, () => {
      if (roleId !== "1") return;
      const g = getGame(gameId);
      if (!g) return;
      const round = g.rounds[g.currentRound - 1];
      if (round) {
        round.worldEvent = null;
        setGame(g);
        broadcastGameState(io, gameId);
      }
    });

    socket.on("disconnect", () => {
      if (roleNum >= 2) {
        const g = getGame(gameId);
        if (!g) return;
        const r = g.roles.find((role) => role.id === roleId);
        if (r) {
          r.playerConnected = false;
          setGame(g);
          broadcastGameState(io, gameId);
        }
      }
    });
  });
}
