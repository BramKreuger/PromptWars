"use client";

import { useParams } from "next/navigation";

export default function GamePage() {
  const { gameId, roleId } = useParams<{ gameId: string; roleId: string }>();

  const isGamemaster = roleId === "0";
  const isSpectator = roleId === "spectator";

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

      {isGamemaster && <GamemasterView gameId={gameId} />}
      {isSpectator && <SpectatorView gameId={gameId} />}
      {!isGamemaster && !isSpectator && (
        <PlayerView gameId={gameId} roleId={roleId} />
      )}
    </main>
  );
}

function GamemasterView({ gameId }: { gameId: string }) {
  return (
    <div className="panel-retro">
      <h2 className="mb-4 text-sm text-[var(--color-retro-warning)]">
        Gamemaster Dashboard
      </h2>
      <p className="text-xs text-[var(--color-retro-muted)]">
        Game {gameId} — Waiting for implementation...
      </p>
    </div>
  );
}

function PlayerView({
  gameId,
  roleId,
}: {
  gameId: string;
  roleId: string;
}) {
  return (
    <div className="panel-retro">
      <h2 className="mb-4 text-sm">Your Role</h2>
      <p className="text-xs text-[var(--color-retro-muted)]">
        Game {gameId}, Role {roleId} — Waiting for implementation...
      </p>
    </div>
  );
}

function SpectatorView({ gameId }: { gameId: string }) {
  return (
    <div className="panel-retro">
      <h2 className="mb-4 text-sm">Spectator Mode</h2>
      <p className="text-xs text-[var(--color-retro-muted)]">
        Watching game {gameId} — Waiting for implementation...
      </p>
    </div>
  );
}
