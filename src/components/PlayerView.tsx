"use client";

import type { GameState } from "@/lib/types";
import { Timer } from "./Timer";
import { WorldEventCard } from "./WorldEventCard";
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
    role?.promptHistory.length
      ? role.promptHistory[role.promptHistory.length - 1]
      : null;

  if (!role) {
    return (
      <div className="panel-retro text-center">
        <p className="text-xs text-[var(--color-retro-accent)]">
          Invalid player number. Check your join info.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {/* Role + Goal — compact header */}
      <div className="panel-retro shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--color-retro-border)] text-sm">
            {role.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold">{role.name}</span>
            <span className="ml-2 text-xs text-[var(--color-retro-muted)]">{role.description}</span>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--color-retro-border)] pt-1">
          <div>
            <span className="text-xs text-[var(--color-retro-warning)]">Goal:</span>{" "}
            <span className="text-xs">{role.goal}</span>
          </div>
          {role.secret && (
            <div>
              <span className="text-xs text-[var(--color-retro-accent)]">Secret:</span>{" "}
              <span className="text-xs">{role.secret}</span>
            </div>
          )}
        </div>
        {role.goalProgress && (
          <div className="mt-1 border-t border-[var(--color-retro-border)] pt-1">
            <span className="text-xs text-[var(--color-retro-success)]">Progress:</span>{" "}
            <span className="text-xs">{role.goalProgress}</span>
          </div>
        )}
      </div>

      {/* Lobby */}
      {game.phase === "lobby" && (
        <div className="panel-retro flex-1 text-center">
          <p className="text-sm">{game.scenario.description}</p>
          <p className="mt-3 text-xs text-[var(--color-retro-muted)]">
            Waiting for the gamemaster to start...
          </p>
        </div>
      )}

      {/* Prompting */}
      {game.phase === "prompting" && (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <Timer
            secondsRemaining={secondsRemaining}
            visible={game.settings.timerVisible}
          />

          {currentRound?.worldEvent && (
            <div className="panel-retro shrink-0 border-[var(--color-retro-warning)]">
              <span className="text-xs font-bold uppercase text-[var(--color-retro-warning)]">
                Event:
              </span>{" "}
              <span className="text-xs">{currentRound.worldEvent.text}</span>
            </div>
          )}

          <div className="min-h-0 flex-1">
            <PromptEditor
              onSubmit={onSubmitPrompt}
              previousPrompt={game.settings.promptHistory ? lastPrompt : null}
              submitted={!!role.currentPrompt}
            />
          </div>

          {game.paused && (
            <div className="text-center text-xs text-[var(--color-retro-accent)]">
              Game paused by gamemaster
            </div>
          )}
        </div>
      )}

      {/* Resolving */}
      {game.phase === "resolving" && (
        <div className="panel-retro flex flex-1 items-center justify-center text-center">
          <p className="text-xs text-[var(--color-retro-muted)]">
            Actions resolving... watch the big screen!
          </p>
        </div>
      )}

      {/* Summary */}
      {game.phase === "summary" && (
        <div className="panel-retro flex-1">
          <p className="text-xs text-[var(--color-retro-muted)]">
            Round {game.currentRound} complete
          </p>
          {currentRound?.summary && (
            <p className="mt-2 text-xs leading-relaxed">
              {currentRound.summary}
            </p>
          )}
        </div>
      )}

      {/* Scoring */}
      {game.phase === "scoring" && (
        <div className="panel-retro flex flex-1 items-center justify-center text-center">
          <p className="text-xs text-[var(--color-retro-muted)]">
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
