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
    <div className="flex flex-col gap-4">
      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[var(--color-retro-warning)]">
          GM Dashboard
        </span>
        <span className="text-[var(--color-retro-muted)]">
          Round {game.currentRound}/{game.settings.rounds} — Phase:{" "}
          {game.phase}
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
        <>
          <div className="panel-retro">
            <h3 className="mb-2 text-xs text-[var(--color-retro-muted)]">
              Scenario
            </h3>
            <p className="text-xs leading-relaxed">
              {game.scenario.description}
            </p>
          </div>

          <div className="panel-retro">
            <h3 className="mb-3 text-xs text-[var(--color-retro-muted)]">
              Roles & Join Codes — Share these with players
            </h3>
            <div className="flex flex-col gap-3">
              {game.roles.map((role) => (
                <div key={role.id} className="flex items-center gap-3">
                  <RoleCard role={role} showGoal showSecret showCode compact />
                </div>
              ))}
            </div>
          </div>

          <button className="btn-retro" onClick={onAdvance}>
            Start Round 1
          </button>
        </>
      )}

      {/* Prompting phase */}
      {game.phase === "prompting" && (
        <>
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
            />
          )}

          <div className="panel-retro">
            <h3 className="mb-3 text-xs text-[var(--color-retro-muted)]">
              Player Prompts ({promptedCount}/{game.roles.length} submitted)
            </h3>
            <div className="flex flex-col gap-2">
              {game.roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between border-b border-[var(--color-retro-border)] pb-2 last:border-0"
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
                        &ldquo;{role.currentPrompt.slice(0, 80)}
                        {role.currentPrompt.length > 80 ? "..." : ""}&rdquo;
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

          <div className="flex gap-3">
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
        </>
      )}

      {/* Resolving phase */}
      {game.phase === "resolving" && (
        <>
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}
          <div className="panel-retro">
            <h3 className="mb-3 text-xs text-[var(--color-retro-muted)]">
              Resolving actions... ({currentRound?.actions.length || 0}/
              {game.roles.length})
            </h3>
            <div className="flex flex-col gap-3">
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
          </div>
        </>
      )}

      {/* Summary phase */}
      {game.phase === "summary" && (
        <>
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}
          <div className="panel-retro">
            <h3 className="mb-3 text-xs text-[var(--color-retro-muted)]">
              Round {game.currentRound} Actions
            </h3>
            <div className="flex flex-col gap-3">
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
          </div>

          <button className="btn-retro" onClick={onAdvance}>
            {game.currentRound >= game.settings.rounds
              ? "Score Game"
              : `Start Round ${game.currentRound + 1}`}
          </button>
        </>
      )}

      {/* Finished */}
      {(game.phase === "finished" || game.phase === "scoring") && (
        <>
          {game.phase === "scoring" && (
            <div className="panel-retro text-center">
              <p className="text-xs text-[var(--color-retro-muted)]">
                Calculating scores...
              </p>
            </div>
          )}
          {game.phase === "finished" && <ResultsScreen game={game} />}
        </>
      )}

      {/* Game history (collapsed) */}
      {game.currentRound > 1 && game.phase !== "finished" && (
        <details className="panel-retro">
          <summary className="cursor-pointer text-xs text-[var(--color-retro-muted)]">
            Previous rounds
          </summary>
          <div className="mt-3 flex flex-col gap-4">
            {game.rounds.slice(0, -1).map((round) => (
              <div key={round.number}>
                <h4 className="text-xs font-bold text-[var(--color-retro-muted)]">
                  Round {round.number}
                </h4>
                {round.worldEvent && (
                  <p className="mt-1 text-xs text-[var(--color-retro-warning)]">
                    Event: {round.worldEvent.text}
                  </p>
                )}
                {round.actions.map((action) => {
                  const role = game.roles.find(
                    (r) => r.id === action.roleId,
                  );
                  return (
                    <p
                      key={action.roleId}
                      className="mt-1 text-xs text-[var(--color-retro-muted)]"
                    >
                      <strong>{role?.name}:</strong> {action.actionText}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
