"use client";

import type { WorldEvent } from "@/lib/types";

interface WorldEventCardProps {
  event: WorldEvent;
  editable?: boolean;
  hideImage?: boolean;
  onEdit?: (text: string) => void;
  onSkip?: () => void;
}

export function WorldEventCard({
  event,
  editable = false,
  hideImage = false,
  onEdit,
  onSkip,
}: WorldEventCardProps) {
  return (
    <div className="panel-retro border-[var(--color-retro-warning)]">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">⚡</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-retro-warning)]">
          World Event
        </span>
        {event.injectedBy === "gamemaster" && (
          <span className="text-xs text-[var(--color-retro-muted)]">
            (GM edited)
          </span>
        )}
      </div>

      {!hideImage && event.imageUrl && (
        <img
          src={event.imageUrl}
          alt="World event scene"
          className="mb-2 max-h-[35vh] w-full rounded object-cover"
        />
      )}

      {editable ? (
        <textarea
          className="w-full bg-[var(--color-retro-bg)] p-2 text-xs leading-relaxed text-[var(--color-retro-text)] outline-none"
          value={event.text}
          onChange={(e) => onEdit?.(e.target.value)}
          rows={3}
        />
      ) : (
        <p className="text-xs leading-relaxed text-[var(--color-retro-text)]">
          {event.text}
        </p>
      )}

      {editable && onSkip && (
        <button
          className="mt-2 text-xs text-[var(--color-retro-muted)] hover:text-[var(--color-retro-accent)]"
          onClick={onSkip}
        >
          Skip event
        </button>
      )}
    </div>
  );
}
