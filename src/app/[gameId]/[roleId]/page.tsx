"use client";

import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useSound } from "@/hooks/useSound";
import { useEffect, useRef } from "react";
import { GamemasterDashboard } from "@/components/GamemasterDashboard";
import { PlayerView } from "@/components/PlayerView";
import { SpectatorView } from "@/components/SpectatorView";

export default function GamePage() {
  const { gameId, roleId } = useParams<{ gameId: string; roleId: string }>();

  const {
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
  } = useSocket(gameId, roleId);

  const soundEnabled = gameState?.settings.soundEnabled ?? false;
  const sounds = useSound(soundEnabled);
  const prevPhaseRef = useRef<string | null>(null);
  const prevSecondsRef = useRef<number | null>(null);

  // Sound effects on phase changes
  useEffect(() => {
    if (!gameState) return;
    const phase = gameState.phase;

    if (prevPhaseRef.current && prevPhaseRef.current !== phase) {
      if (phase === "prompting") sounds.playRoundStart();
      if (phase === "finished") sounds.playVictory();
    }
    prevPhaseRef.current = phase;
  }, [gameState?.phase, sounds]);

  // Sound effects on timer ticks
  useEffect(() => {
    if (secondsRemaining === null) return;
    if (prevSecondsRef.current !== null && secondsRemaining !== prevSecondsRef.current) {
      if (secondsRemaining <= 10 && secondsRemaining > 0) {
        sounds.playTimerUrgent();
      }
    }
    prevSecondsRef.current = secondsRemaining;
  }, [secondsRemaining, sounds]);

  // Sound on action resolved
  useEffect(() => {
    if (lastAction) sounds.playActionResolve();
  }, [lastAction, sounds]);

  const isGamemaster = roleId === "0";
  const isSpectator = roleId === "spectator";

  if (!isConnected) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xs text-[var(--color-retro-muted)]">
          Connecting...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xs text-[var(--color-retro-accent)]">{error}</p>
      </main>
    );
  }

  if (!gameState) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xs text-[var(--color-retro-muted)]">
          Loading game...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-sm text-[var(--color-retro-accent)]">
          PROMPTWARS
        </h1>
        <span className="text-xs text-[var(--color-retro-muted)]">
          Game: {gameId}
        </span>
      </header>

      {isGamemaster && (
        <GamemasterDashboard
          game={gameState}
          secondsRemaining={secondsRemaining}
          onAdvance={gmAdvance}
          onPause={gmPause}
          onResume={gmResume}
          onEditWorldEvent={gmEditWorldEvent}
          onSkipWorldEvent={gmSkipWorldEvent}
        />
      )}

      {isSpectator && (
        <SpectatorView
          game={gameState}
          secondsRemaining={secondsRemaining}
        />
      )}

      {!isGamemaster && !isSpectator && (
        <PlayerView
          game={gameState}
          roleId={roleId}
          secondsRemaining={secondsRemaining}
          onSubmitPrompt={submitPrompt}
        />
      )}
    </main>
  );
}
