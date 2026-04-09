"use client";

import type { GameState } from "@/lib/types";
import { Timer } from "./Timer";
import { RoleCard } from "./RoleCard";
import { WorldEventCard } from "./WorldEventCard";
import { ActionCard } from "./ActionCard";
import { ResultsScreen } from "./ResultsScreen";

interface GamemasterDashboardProps {
  game: GameState;
  secondsRemaining: number | null;
  onAdvance: () => void;
  onPause: () => void;
  onResume: () => void;
  onEditWorldEvent: (text: string) => void;
  onSkipWorldEvent: () => void;
}

export function GamemasterDashboard({
  game,
  secondsRemaining,
  onAdvance,
  onPause,
  onResume,
  onEditWorldEvent,
  onSkipWorldEvent,
}: GamemasterDashboardProps) {
  const currentRound = game.rounds[game.currentRound - 1];
  const connectedCount = game.roles.filter((r) => r.playerConnected).length;
  const promptedCount = game.roles.filter((r) => r.currentPrompt).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* Status bar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[var(--color-retro-warning)]">
          GM Dashboard
        </span>
        <span className="text-[var(--color-retro-muted)]">
          Round {game.currentRound}/{game.settings.rounds} — {game.phase}
        </span>
        <span className="text-[var(--color-retro-muted)]">
          Players: {connectedCount}/{game.roles.length}
        </span>
        {game.paused && (
          <span className="text-[var(--color-retro-accent)]">PAUSED</span>
        )}
      </div>

      {/* Lobby phase */}
      {game.phase === "lobby" && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="panel-retro shrink-0">
            <p className="text-xs leading-relaxed">
              {game.scenario.description}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <div className="flex flex-col gap-2">
              {game.roles.map((role) => (
                <RoleCard key={role.id} role={role} showGoal showSecret showCode compact />
              ))}
            </div>
          </div>

          <button className="btn-retro shrink-0" onClick={onAdvance}>
            Start Round 1
          </button>
        </div>
      )}

      {/* Prompting phase */}
      {game.phase === "prompting" && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Timer
            secondsRemaining={secondsRemaining}
            visible={game.settings.timerVisible}
          />

          {currentRound?.worldEvent && (
            <WorldEventCard
              event={currentRound.worldEvent}
              editable
              onEdit={onEditWorldEvent}
              onSkip={onSkipWorldEvent}
              hideImage
            />
          )}

          <div className="panel-retro min-h-0 flex-1 overflow-auto">
            <h3 className="mb-2 text-xs text-[var(--color-retro-muted)]">
              Prompts ({promptedCount}/{game.roles.length})
            </h3>
            <div className="flex flex-col gap-1">
              {game.roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between border-b border-[var(--color-retro-border)] pb-1 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${role.playerConnected ? "text-[var(--color-retro-success)]" : "text-[var(--color-retro-accent)]"}`}
                    >
                      ●
                    </span>
                    <span className="text-xs">{role.name}</span>
                  </div>
                  <div className="max-w-[60%] text-right">
                    {role.currentPrompt ? (
                      <span className="text-xs text-[var(--color-retro-muted)]">
                        &ldquo;{role.currentPrompt.slice(0, 60)}
                        {role.currentPrompt.length > 60 ? "..." : ""}&rdquo;
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-retro-muted)]">
                        Waiting...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button className="btn-retro flex-1" onClick={onAdvance}>
              Advance Now
            </button>
            {game.paused ? (
              <button className="btn-retro" onClick={onResume}>
                Resume
              </button>
            ) : (
              <button className="btn-retro" onClick={onPause}>
                Pause
              </button>
            )}
          </div>
        </div>
      )}

      {/* Resolving phase */}
      {game.phase === "resolving" && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
          <h3 className="shrink-0 text-xs text-[var(--color-retro-muted)]">
            Resolving... ({currentRound?.actions.length || 0}/{game.roles.length})
          </h3>
          {currentRound?.actions.map((action) => {
            const role = game.roles.find((r) => r.id === action.roleId);
            return (
              <ActionCard
                key={action.roleId}
                action={action}
                roleName={role?.name || action.roleId}
                showPrompt
              />
            );
          })}
        </div>
      )}

      {/* Summary phase */}
      {game.phase === "summary" && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="min-h-0 flex-1 overflow-auto">
            {currentRound?.actions.map((action) => {
              const role = game.roles.find((r) => r.id === action.roleId);
              return (
                <ActionCard
                  key={action.roleId}
                  action={action}
                  roleName={role?.name || action.roleId}
                  showPrompt
                />
              );
            })}
            {currentRound?.summary && (
              <div className="mt-2 border-l-4 border-[var(--color-retro-warning)] pl-2">
                <p className="text-xs leading-relaxed">{currentRound.summary}</p>
              </div>
            )}
          </div>

          <button className="btn-retro shrink-0" onClick={onAdvance}>
            {game.currentRound >= game.settings.rounds
              ? "Score Game"
              : `Start Round ${game.currentRound + 1}`}
          </button>
        </div>
      )}

      {/* Finished */}
      {(game.phase === "finished" || game.phase === "scoring") && (
        <div className="min-h-0 flex-1 overflow-auto">
          {game.phase === "scoring" && (
            <div className="panel-retro text-center">
              <p className="text-xs text-[var(--color-retro-muted)]">
                Calculating scores...
              </p>
            </div>
          )}
          {game.phase === "finished" && <ResultsScreen game={game} />}
        </div>
      )}
    </div>
  );
}
