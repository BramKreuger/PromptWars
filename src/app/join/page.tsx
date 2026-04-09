"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGamePage() {
  const router = useRouter();
  const [playerNum, setPlayerNum] = useState("");

  function handleJoin() {
    const num = playerNum.trim();
    if (num) {
      router.push(`/play/${num}`);
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
            Your Player Number
          </label>
          <input
            className="mt-1 w-full bg-[var(--color-retro-bg)] p-2 text-sm text-[var(--color-retro-text)] outline-none"
            placeholder="e.g. 2"
            value={playerNum}
            onChange={(e) => setPlayerNum(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
        </div>
        <button
          className="btn-retro"
          onClick={handleJoin}
          disabled={!playerNum.trim()}
        >
          Enter
        </button>
      </div>
    </main>
  );
}
