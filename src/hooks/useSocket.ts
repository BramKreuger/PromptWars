"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { GameState, Action } from "@/lib/types";
import { SocketEvents } from "@/lib/socket-events";

interface UseSocketReturn {
  gameState: GameState | null;
  isConnected: boolean;
  secondsRemaining: number | null;
  error: string | null;
  submitPrompt: (prompt: string) => void;
  gmAdvance: () => void;
  gmPause: () => void;
  gmResume: () => void;
  gmEditWorldEvent: (text: string) => void;
  gmSkipWorldEvent: () => void;
  lastAction: { action: Action; roleName: string } | null;
}

export function useSocket(gameId: string | null, roleId: string): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{
    action: Action;
    roleName: string;
  } | null>(null);

  useEffect(() => {
    const query: Record<string, string> = { roleId };
    if (gameId) query.gameId = gameId;

    const socket = io({ query });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });
    socket.on("disconnect", () => setIsConnected(false));

    socket.on(SocketEvents.GAME_STATE_UPDATE, (state: GameState) => {
      setGameState(state);
    });

    socket.on(
      SocketEvents.TIMER_TICK,
      ({ secondsRemaining: s }: { secondsRemaining: number }) => {
        setSecondsRemaining(s);
      },
    );

    socket.on(SocketEvents.TIMER_EXPIRED, () => {
      setSecondsRemaining(0);
    });

    socket.on(
      SocketEvents.ACTION_RESOLVED,
      (data: { action: Action; roleName: string }) => {
        setLastAction(data);
      },
    );

    socket.on(SocketEvents.ERROR, ({ message }: { message: string }) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, roleId]);

  const submitPrompt = useCallback((prompt: string) => {
    socketRef.current?.emit(SocketEvents.SUBMIT_PROMPT, { prompt });
  }, []);

  const gmAdvance = useCallback(() => {
    socketRef.current?.emit(SocketEvents.GM_ADVANCE);
  }, []);

  const gmPause = useCallback(() => {
    socketRef.current?.emit(SocketEvents.GM_PAUSE);
  }, []);

  const gmResume = useCallback(() => {
    socketRef.current?.emit(SocketEvents.GM_RESUME);
  }, []);

  const gmEditWorldEvent = useCallback((text: string) => {
    socketRef.current?.emit(SocketEvents.GM_EDIT_WORLD_EVENT, { text });
  }, []);

  const gmSkipWorldEvent = useCallback(() => {
    socketRef.current?.emit(SocketEvents.GM_SKIP_WORLD_EVENT);
  }, []);

  return {
    gameState,
    isConnected,
    secondsRemaining,
    error,
    submitPrompt,
    gmAdvance,
    gmPause,
    gmResume,
    gmEditWorldEvent,
    gmSkipWorldEvent,
    lastAction,
  };
}
