import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-widest text-[var(--color-retro-accent)]">
        PROMPTWARS
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--color-retro-muted)]">
        Write prompts. Control your AI agent. Outsmart your rivals.
      </p>

      <div className="flex flex-col gap-4">
        <Link href="/create" className="btn-retro text-center">
          Create Game
        </Link>
        <Link href="/join" className="btn-retro text-center">
          Join Game
        </Link>
      </div>

      <footer className="mt-16 text-xs text-[var(--color-retro-muted)]">
        v0.1.0 — Phase 1 MVP
      </footer>
    </main>
  );
}
