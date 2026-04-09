"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGamePage() {
  const router = useRouter();
  const [scenario, setScenario] = useState("");
  const [playerCount, setPlayerCount] = useState(4);
  const [rounds, setRounds] = useState(5);
  const [promptTime, setPromptTime] = useState(90);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, playerCount, rounds, promptTime }),
      });
      await res.json();
      router.push("/play/1");
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl text-[var(--color-retro-accent)]">
        Create Game
      </h1>

      <div className="panel-retro flex flex-col gap-4">
        <label className="text-xs text-[var(--color-retro-muted)]">
          Describe your scenario
        </label>
        <textarea
          className="min-h-[120px] w-full resize-y bg-[var(--color-retro-bg)] p-3 text-sm text-[var(--color-retro-text)] outline-none"
          placeholder="A tense UN Security Council meeting about a newly discovered asteroid heading toward Earth..."
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-[var(--color-retro-muted)]">
              Players
            </label>
            <input
              type="number"
              min={2}
              max={8}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="mt-1 w-full bg-[var(--color-retro-bg)] p-2 text-sm text-[var(--color-retro-text)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-retro-muted)]">
              Rounds
            </label>
            <input
              type="number"
              min={3}
              max={10}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="mt-1 w-full bg-[var(--color-retro-bg)] p-2 text-sm text-[var(--color-retro-text)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-retro-muted)]">
              Prompt Time (s)
            </label>
            <input
              type="number"
              min={30}
              max={300}
              step={10}
              value={promptTime}
              onChange={(e) => setPromptTime(Number(e.target.value))}
              className="mt-1 w-full bg-[var(--color-retro-bg)] p-2 text-sm text-[var(--color-retro-text)] outline-none"
            />
          </div>
        </div>

        <div className="text-xs text-[var(--color-retro-muted)]">
          Estimated duration:{" "}
          {Math.ceil(
            ((promptTime + playerCount * 15 + 20) * rounds) / 60
          )}{" "}
          min
        </div>

        <button
          className="btn-retro mt-2"
          onClick={handleCreate}
          disabled={loading || !scenario.trim()}
        >
          {loading ? "Generating..." : "Generate Scenario"}
        </button>
      </div>
    </main>
  );
}
