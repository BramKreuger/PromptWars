"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGamePage() {
  const router = useRouter();
  const [gameId, setGameId] = useState("");
  const [code, setCode] = useState("");

  function handleJoin() {
    if (gameId.trim() && code.trim()) {
      router.push(`/${gameId.trim()}/${code.trim()}`);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-xl text-[var(--color-retro-accent)]">
        Join Game
      </h1>

      <div className="panel-retro flex w-full max-w-sm flex-col gap-4">
        <div>
          <label className="text-xs text-[var(--color-retro-muted)]">
            Game ID
          </label>
          <input
            className="mt-1 w-full bg-[var(--color-retro-bg)] p-2 text-sm text-[var(--color-retro-text)] outline-none"
            placeholder="e.g. abc123"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-retro-muted)]">
            Your Code
          </label>
          <input
            className="mt-1 w-full bg-[var(--color-retro-bg)] p-2 text-sm text-[var(--color-retro-text)] outline-none"
            placeholder="e.g. A7X2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <button
          className="btn-retro"
          onClick={handleJoin}
          disabled={!gameId.trim() || !code.trim()}
        >
          Enter
        </button>
      </div>
    </main>
  );
}
