"use client";

interface TimerProps {
  secondsRemaining: number | null;
  visible: boolean;
}

export function Timer({ secondsRemaining, visible }: TimerProps) {
  if (!visible || secondsRemaining === null) return null;

  const isUrgent = secondsRemaining <= 10;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  return (
    <div
      className={`text-center text-2xl font-bold tracking-widest ${
        isUrgent
          ? "animate-pulse text-[var(--color-retro-accent)]"
          : "text-[var(--color-retro-text)]"
      }`}
    >
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
