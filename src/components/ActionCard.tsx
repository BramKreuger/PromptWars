"use client";

import type { Action } from "@/lib/types";

interface ActionCardProps {
  action: Action;
  roleName: string;
  isOwn?: boolean;
  showPrompt?: boolean;
}

export function ActionCard({
  action,
  roleName,
  isOwn = false,
  showPrompt = false,
}: ActionCardProps) {
  return (
    <div
      className={`panel-retro animate-[slideIn_0.3s_ease-out] ${
        isOwn ? "border-[var(--color-retro-success)]" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--color-retro-border)] text-xs">
          {roleName.charAt(0)}
        </div>
        <span className="text-xs font-bold text-[var(--color-retro-text)]">
          {roleName}
        </span>
        {isOwn && (
          <span className="text-xs text-[var(--color-retro-success)]">
            (You)
          </span>
        )}
      </div>

      <p className="text-xs leading-relaxed text-[var(--color-retro-text)]">
        {action.actionText}
      </p>

      {showPrompt && action.promptUsed !== "[Hidden]" && (
        <div className="mt-2 border-t border-[var(--color-retro-border)] pt-2">
          <span className="text-xs text-[var(--color-retro-muted)]">
            Prompt used:
          </span>
          <p className="mt-1 text-xs italic text-[var(--color-retro-muted)]">
            &ldquo;{action.promptUsed}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
