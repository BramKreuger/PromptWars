"use client";

import type { GameState } from "@/lib/types";
import { Timer } from "./Timer";
import { WorldEventCard } from "./WorldEventCard";
import { ActionCard } from "./ActionCard";
import { ResultsScreen } from "./ResultsScreen";

interface SpectatorViewProps {
  game: GameState;
  secondsRemaining: number | null;
}

export function SpectatorView({ game, secondsRemaining }: SpectatorViewProps) {
  const currentRound = game.rounds[game.currentRound - 1];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* Title bar */}
      <div className="flex shrink-0 items-center justify-between">
        <span className="text-sm text-[var(--color-retro-muted)]">
          Round {game.currentRound}/{game.settings.rounds}
        </span>
        <span className="text-sm uppercase text-[var(--color-retro-warning)]">
          {game.phase === "prompting"
            ? "Prompting"
            : game.phase === "resolving"
              ? "Resolving..."
              : game.phase === "summary"
                ? "Round Complete"
                : game.phase === "finished"
                  ? "Game Over"
                  : game.phase}
        </span>
        <span className="text-sm text-[var(--color-retro-muted)]">
          {game.roles.filter((r) => r.playerConnected).length}/{game.roles.length} players
        </span>
      </div>

      {/* Lobby */}
      {game.phase === "lobby" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="panel-retro shrink-0 text-center">
            {game.scenario.sceneImageUrl && (
              <img
                src={game.scenario.sceneImageUrl}
                alt="Scenario scene"
                className="mb-2 max-h-[40vh] w-full rounded object-cover"
              />
            )}
            <p className="text-sm leading-relaxed">
              {game.scenario.description}
            </p>
          </div>

          <div className="panel-retro shrink-0 text-center">
            <p className="text-xs text-[var(--color-retro-muted)]">
              Join at
            </p>
            <p className="text-lg text-[var(--color-retro-accent)]">
              {typeof window !== "undefined" ? window.location.host : "localhost:3000"}/play/YOUR_NUMBER
            </p>
            <p className="mt-1 text-xs text-[var(--color-retro-muted)]">
              or go to /join and enter your player number
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {game.roles.map((role) => (
              <div key={role.id} className="panel-retro text-center">
                <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center bg-[var(--color-retro-border)] text-lg">
                  {role.name.charAt(0)}
                </div>
                <span className="text-xs">{role.name}</span>
                <span className="text-xs text-[var(--color-retro-muted)]"> #{role.id}</span>
                <br />
                <span
                  className={`text-xs ${role.playerConnected ? "text-[var(--color-retro-success)]" : "text-[var(--color-retro-muted)]"}`}
                >
                  {role.playerConnected ? "Ready" : "Waiting..."}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompting */}
      {game.phase === "prompting" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Timer
            secondsRemaining={secondsRemaining}
            visible={game.settings.timerVisible}
          />

          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}

          <div className="panel-retro shrink-0">
            <div className="flex flex-wrap justify-center gap-4">
              {game.roles.map((role) => (
                <div key={role.id} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-12 w-12 items-center justify-center text-lg transition-colors ${
                      role.currentPrompt
                        ? "bg-[var(--color-retro-success)]"
                        : "bg-[var(--color-retro-border)]"
                    }`}
                  >
                    {role.name.charAt(0)}
                  </div>
                  <span className="text-xs">{role.name}</span>
                  <span className="text-xs text-[var(--color-retro-muted)]">
                    {role.currentPrompt ? "Ready" : "Thinking..."}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resolving */}
      {game.phase === "resolving" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}

          {currentRound?.actions.map((action) => {
            const role = game.roles.find((r) => r.id === action.roleId);
            return (
              <ActionCard
                key={action.roleId}
                action={action}
                roleName={role?.name || `Player ${action.roleId}`}
              />
            );
          })}

          {(currentRound?.actions.length || 0) === 0 && (
            <div className="panel-retro text-center">
              <p className="text-sm text-[var(--color-retro-muted)]">
                Resolving actions...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {game.phase === "summary" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}

          {currentRound?.actions.map((action) => {
            const role = game.roles.find((r) => r.id === action.roleId);
            return (
              <ActionCard
                key={action.roleId}
                action={action}
                roleName={role?.name || `Player ${action.roleId}`}
              />
            );
          })}

          {currentRound?.summary && (
            <div className="panel-retro shrink-0 border-l-4 border-[var(--color-retro-warning)]">
              <h3 className="mb-1 text-xs text-[var(--color-retro-warning)]">
                Consequences
              </h3>
              <p className="text-sm leading-relaxed">
                {currentRound.summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scoring */}
      {game.phase === "scoring" && (
        <div className="panel-retro text-center">
          <p className="text-sm text-[var(--color-retro-muted)]">
            Calculating final scores...
          </p>
        </div>
      )}

      {/* Finished */}
      {game.phase === "finished" && (
        <div className="min-h-0 flex-1 overflow-auto">
          <ResultsScreen game={game} />
        </div>
      )}
    </div>
  );
}
