"use client";

import type { Role } from "@/lib/types";

interface RoleCardProps {
  role: Role;
  showGoal?: boolean;
  showSecret?: boolean;
  showCode?: boolean;
  compact?: boolean;
}

export function RoleCard({
  role,
  showGoal = false,
  showSecret = false,
  showCode = false,
  compact = false,
}: RoleCardProps) {
  return (
    <div className="panel-retro">
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--color-retro-border)] text-lg">
          {role.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--color-retro-text)]">
              {role.name}
            </span>
            {showCode && (
              <span className="text-xs text-[var(--color-retro-accent)]">
                [{role.id}]
              </span>
            )}
            {role.playerConnected && (
              <span className="text-xs text-[var(--color-retro-success)]">
                ●
              </span>
            )}
          </div>
          {!compact && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-retro-muted)]">
              {role.description}
            </p>
          )}
        </div>
      </div>

      {showGoal && role.goal !== "[Hidden]" && (
        <div className="mt-3 border-t border-[var(--color-retro-border)] pt-2">
          <span className="text-xs text-[var(--color-retro-warning)]">
            Goal:
          </span>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-retro-text)]">
            {role.goal}
          </p>
        </div>
      )}

      {showSecret && role.secret && (
        <div className="mt-2 border-t border-[var(--color-retro-border)] pt-2">
          <span className="text-xs text-[var(--color-retro-accent)]">
            Secret:
          </span>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-retro-text)]">
            {role.secret}
          </p>
        </div>
      )}
    </div>
  );
}
