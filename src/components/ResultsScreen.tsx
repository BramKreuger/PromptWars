"use client";

import type { GameState } from "@/lib/types";
import { RoleCard } from "./RoleCard";

interface ResultsScreenProps {
  game: GameState;
}

export function ResultsScreen({ game }: ResultsScreenProps) {
  const sortedRoles = [...game.roles].sort(
    (a, b) => (b.score || 0) - (a.score || 0),
  );
  const winner = sortedRoles[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Victory banner */}
      <div className="panel-retro border-[var(--color-retro-warning)] text-center">
        <h2 className="mb-2 text-lg text-[var(--color-retro-warning)]">
          GAME OVER
        </h2>
        {winner && (
          <p className="text-sm text-[var(--color-retro-text)]">
            Winner: <strong>{winner.name}</strong> — Score: {winner.score}/10
          </p>
        )}
      </div>

      {/* Scoreboard */}
      <div>
        <h3 className="mb-3 text-xs uppercase tracking-wider text-[var(--color-retro-muted)]">
          Scoreboard
        </h3>
        <div className="flex flex-col gap-3">
          {sortedRoles.map((role, i) => (
            <div
              key={role.id}
              className={`panel-retro ${i === 0 ? "border-[var(--color-retro-warning)]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg text-[var(--color-retro-muted)]">
                    #{i + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold">{role.name}</span>
                    <span className="ml-2 text-xs text-[var(--color-retro-muted)]">
                      {role.description}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-lg font-bold ${
                    i === 0
                      ? "text-[var(--color-retro-warning)]"
                      : "text-[var(--color-retro-text)]"
                  }`}
                >
                  {role.score}/10
                </span>
              </div>
              {role.scoreJustification && (
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-retro-muted)]">
                  {role.scoreJustification}
                </p>
              )}
              <div className="mt-2 text-xs text-[var(--color-retro-warning)]">
                Goal: {role.goal}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Awards */}
      {game.awards.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-wider text-[var(--color-retro-muted)]">
            Awards
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {game.awards.map((award, i) => {
              const awardRole = game.roles.find((r) => r.id === award.roleId);
              return (
                <div key={i} className="panel-retro">
                  <span className="text-xs font-bold text-[var(--color-retro-accent)]">
                    {award.award}
                  </span>
                  <p className="mt-1 text-xs text-[var(--color-retro-text)]">
                    {awardRole?.name || award.roleId}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-retro-muted)]">
                    {award.reason}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Game narrative */}
      {game.gameNarrative.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs uppercase tracking-wider text-[var(--color-retro-muted)]">
            The Story
          </h3>
          <div className="panel-retro">
            <p className="text-xs leading-relaxed text-[var(--color-retro-text)]">
              {game.gameNarrative[game.gameNarrative.length - 1]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
