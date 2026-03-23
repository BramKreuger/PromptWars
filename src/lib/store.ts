import type { GameState } from "./types";

/**
 * In-memory game store for MVP.
 * Replace with Redis for production.
 */
const games = new Map<string, GameState>();

export function getGame(id: string): GameState | undefined {
  return games.get(id);
}

export function setGame(game: GameState): void {
  games.set(game.id, game);
}

export function deleteGame(id: string): void {
  games.delete(id);
}

export function getAllGames(): GameState[] {
  return Array.from(games.values());
}
