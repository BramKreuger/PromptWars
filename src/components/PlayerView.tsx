"use client";

import type { GameState } from "@/lib/types";
import { Timer } from "./Timer";
import { RoleCard } from "./RoleCard";
import { WorldEventCard } from "./WorldEventCard";
import { ActionCard } from "./ActionCard";
import { PromptEditor } from "./PromptEditor";
import { ResultsScreen } from "./ResultsScreen";

interface PlayerViewProps {
  game: GameState;
  roleId: string;
  secondsRemaining: number | null;
  onSubmitPrompt: (prompt: string) => void;
}

export function PlayerView({
  game,
  roleId,
  secondsRemaining,
  onSubmitPrompt,
}: PlayerViewProps) {
  const role = game.roles.find((r) => r.id === roleId);
  const currentRound = game.rounds[game.currentRound - 1];
  const lastPrompt =
    role?.promptHistory.length ? role.promptHistory[role.promptHistory.length - 1] : null;

  if (!role) {
    return (
      <div className="panel-retro text-center">
        <p className="text-xs text-[var(--color-retro-accent)]">
          Invalid role code. Check your join code.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Role info (always visible) */}
      <RoleCard role={role} showGoal showSecret />

      {/* Lobby */}
      {game.phase === "lobby" && (
        <div className="panel-retro text-center">
          <p className="text-xs text-[var(--color-retro-muted)]">
            Waiting for the gamemaster to start...
          </p>
          <div className="mt-3">
            <h3 className="mb-2 text-xs text-[var(--color-retro-muted)]">
              Scenario
            </h3>
            <p className="text-xs leading-relaxed">
              {game.scenario.description}
            </p>
          </div>
        </div>
      )}

      {/* Prompting */}
      {game.phase === "prompting" && (
        <>
          <Timer
            secondsRemaining={secondsRemaining}
            visible={game.settings.timerVisible}
          />

          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}

          {/* Game state context */}
          {game.currentRound > 1 && (
            <details className="panel-retro" open>
              <summary className="cursor-pointer text-xs text-[var(--color-retro-muted)]">
                What happened so far
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                {game.rounds.slice(0, -1).map((round) => (
                  <div key={round.number}>
                    <span className="text-xs font-bold text-[var(--color-retro-muted)]">
                      Round {round.number}:
                    </span>
                    {round.worldEvent && (
                      <p className="text-xs text-[var(--color-retro-warning)]">
                        {round.worldEvent.text}
                      </p>
                    )}
                    {round.actions.map((action) => {
                      const r = game.roles.find(
                        (rl) => rl.id === action.roleId,
                      );
                      return (
                        <p
                          key={action.roleId}
                          className="text-xs text-[var(--color-retro-muted)]"
                        >
                          {r?.name}: {action.actionText}
                        </p>
                      );
                    })}
                  </div>
                ))}
              </div>
            </details>
          )}

          <PromptEditor
            onSubmit={onSubmitPrompt}
            previousPrompt={
              game.settings.promptHistory ? lastPrompt : null
            }
            submitted={!!role.currentPrompt}
          />

          {game.paused && (
            <div className="text-center text-xs text-[var(--color-retro-accent)]">
              Game paused by gamemaster
            </div>
          )}
        </>
      )}

      {/* Resolving */}
      {game.phase === "resolving" && (
        <>
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}
          <div className="panel-retro">
            <h3 className="mb-3 text-xs text-[var(--color-retro-muted)]">
              Actions resolving...
            </h3>
            <div className="flex flex-col gap-3">
              {currentRound?.actions.map((action) => {
                const r = game.roles.find((rl) => rl.id === action.roleId);
                return (
                  <ActionCard
                    key={action.roleId}
                    action={action}
                    roleName={r?.name || action.roleId}
                    isOwn={action.roleId === roleId}
                    showPrompt={action.roleId === roleId}
                  />
                );
              })}
            </div>
            {(currentRound?.actions.length || 0) === 0 && (
              <p className="text-center text-xs text-[var(--color-retro-muted)]">
                Waiting for first action...
              </p>
            )}
          </div>
        </>
      )}

      {/* Summary */}
      {game.phase === "summary" && (
        <>
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}
          <div className="panel-retro">
            <h3 className="mb-3 text-xs text-[var(--color-retro-muted)]">
              Round {game.currentRound} Complete
            </h3>
            <div className="flex flex-col gap-3">
              {currentRound?.actions.map((action) => {
                const r = game.roles.find((rl) => rl.id === action.roleId);
                return (
                  <ActionCard
                    key={action.roleId}
                    action={action}
                    roleName={r?.name || action.roleId}
                    isOwn={action.roleId === roleId}
                    showPrompt={action.roleId === roleId}
                  />
                );
              })}
            </div>
          </div>
          <div className="text-center text-xs text-[var(--color-retro-muted)]">
            Waiting for next round...
          </div>
        </>
      )}

      {/* Scoring */}
      {game.phase === "scoring" && (
        <div className="panel-retro text-center">
          <p className="text-xs text-[var(--color-retro-muted)]">
            Calculating final scores...
          </p>
        </div>
      )}

      {/* Finished */}
      {game.phase === "finished" && <ResultsScreen game={game} />}
    </div>
  );
}
