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
    <div className="flex flex-col gap-4">
      {/* Scenario */}
      <div className="panel-retro">
        <p className="text-xs leading-relaxed">{game.scenario.description}</p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-[var(--color-retro-muted)]">
        <span>
          Round {game.currentRound}/{game.settings.rounds}
        </span>
        <span className="uppercase">{game.phase}</span>
        <span>
          {game.roles.filter((r) => r.playerConnected).length} players
        </span>
      </div>

      {game.phase === "lobby" && (
        <div className="panel-retro text-center">
          <p className="text-sm text-[var(--color-retro-muted)]">
            Waiting for game to start...
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {game.roles.map((role) => (
              <div key={role.id} className="panel-retro text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center bg-[var(--color-retro-border)] text-lg">
                  {role.name.charAt(0)}
                </div>
                <span className="text-xs">{role.name}</span>
                <br />
                <span
                  className={`text-xs ${role.playerConnected ? "text-[var(--color-retro-success)]" : "text-[var(--color-retro-muted)]"}`}
                >
                  {role.playerConnected ? "Ready" : "Waiting"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {game.phase === "prompting" && (
        <>
          <Timer
            secondsRemaining={secondsRemaining}
            visible={game.settings.timerVisible}
          />
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}
          <div className="panel-retro text-center">
            <p className="text-xs text-[var(--color-retro-muted)]">
              Players are writing their prompts...
            </p>
            <div className="mt-3 flex justify-center gap-2">
              {game.roles.map((role) => (
                <div
                  key={role.id}
                  className={`flex h-10 w-10 items-center justify-center text-xs ${
                    role.currentPrompt
                      ? "bg-[var(--color-retro-success)]"
                      : "bg-[var(--color-retro-border)]"
                  }`}
                  title={role.name}
                >
                  {role.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {(game.phase === "resolving" || game.phase === "summary") && (
        <>
          {currentRound?.worldEvent && (
            <WorldEventCard event={currentRound.worldEvent} />
          )}
          <div className="flex flex-col gap-3">
            {currentRound?.actions.map((action) => {
              const role = game.roles.find((r) => r.id === action.roleId);
              return (
                <ActionCard
                  key={action.roleId}
                  action={action}
                  roleName={role?.name || action.roleId}
                />
              );
            })}
          </div>
        </>
      )}

      {game.phase === "finished" && <ResultsScreen game={game} />}

      {/* Round history */}
      {game.rounds.length > 1 && (
        <details className="panel-retro">
          <summary className="cursor-pointer text-xs text-[var(--color-retro-muted)]">
            Game history
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {game.rounds.slice(0, -1).map((round) => (
              <div key={round.number}>
                <h4 className="text-xs font-bold text-[var(--color-retro-muted)]">
                  Round {round.number}
                </h4>
                {round.worldEvent && (
                  <p className="text-xs text-[var(--color-retro-warning)]">
                    {round.worldEvent.text}
                  </p>
                )}
                {round.actions.map((action) => {
                  const role = game.roles.find(
                    (r) => r.id === action.roleId,
                  );
                  return (
                    <p
                      key={action.roleId}
                      className="text-xs text-[var(--color-retro-muted)]"
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
