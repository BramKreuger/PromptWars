import type { GameState } from "./types";

/**
 * In-memory game store for MVP.
 * Single-game mode: only one active game at a time.
 */
const games = new Map<string, GameState>();
let activeGameId: string | null = null;

export function getGame(id: string): GameState | undefined {
  return games.get(id);
}

export function setGame(game: GameState): void {
  games.set(game.id, game);
  activeGameId = game.id;
}

export function deleteGame(id: string): void {
  games.delete(id);
  if (activeGameId === id) activeGameId = null;
}

export function getActiveGame(): GameState | undefined {
  if (!activeGameId) return undefined;
  return games.get(activeGameId);
}

export function getAllGames(): GameState[] {
  return Array.from(games.values());
}
