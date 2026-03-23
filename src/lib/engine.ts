import { nanoid } from "nanoid";
import type { GameState, GameSettings, CreateGameRequest } from "./types";
import { getGame, setGame } from "./store";
import { generateScenario, generateWorldEvent, generateAction, generateScores } from "./ai/generate";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createGame(req: CreateGameRequest): Promise<GameState> {
  const gameId = nanoid(8);

  const scenario = await generateScenario(req.scenario, req.playerCount);

  const settings: GameSettings = {
    rounds: req.rounds,
    promptTime: req.promptTime,
    timerVisible: true,
    countdownEnabled: true,
    promptHistory: true,
    showActionsRealtime: true,
    spectatorMode: false,
    soundEnabled: true,
  };

  const roles = scenario.roles.map((r) => ({
    id: generateJoinCode(),
    name: r.name,
    description: r.description,
    goal: r.goal,
    secret: r.secret,
    avatarUrl: null,
    playerConnected: false,
    currentPrompt: null,
    promptHistory: [] as string[],
    score: null,
    scoreJustification: null,
  }));

  const game: GameState = {
    id: gameId,
    scenario: {
      description: scenario.description,
      rules: scenario.rules,
      sceneImageUrl: null,
    },
    settings,
    roles,
    rounds: [],
    currentRound: 0,
    phase: "lobby",
    gameNarrative: [],
    createdAt: Date.now(),
  };

  setGame(game);
  return game;
}

export async function advanceToPrompting(gameId: string): Promise<GameState> {
  const game = getGame(gameId);
  if (!game) throw new Error("Game not found");

  game.currentRound++;
  game.phase = "prompting";

  // Generate world event for this round
  const event = await generateWorldEvent(game);
  const round = {
    number: game.currentRound,
    worldEvent: { text: event.text, imageUrl: null, injectedBy: "ai" as const },
    actions: [],
    summary: null,
  };
  game.rounds.push(round);

  setGame(game);
  return game;
}

export async function resolveRound(gameId: string): Promise<GameState> {
  const game = getGame(gameId);
  if (!game) throw new Error("Game not found");

  game.phase = "resolving";
  const round = game.rounds[game.currentRound - 1];

  // Shuffle roles for random action order
  const shuffledRoles = [...game.roles].sort(() => Math.random() - 0.5);
  const actionDescriptions: string[] = [];

  for (const role of shuffledRoles) {
    if (!role.currentPrompt) continue;

    const result = await generateAction(game, role, actionDescriptions);

    round.actions.push({
      roleId: role.id,
      promptUsed: role.currentPrompt,
      actionText: result.actionText,
      imageUrl: null,
    });

    actionDescriptions.push(`${role.name}: ${result.actionText}`);

    // Save prompt to history
    role.promptHistory.push(role.currentPrompt);
    role.currentPrompt = null;
  }

  game.phase = "summary";
  setGame(game);
  return game;
}

export async function scoreGame(gameId: string): Promise<GameState> {
  const game = getGame(gameId);
  if (!game) throw new Error("Game not found");

  game.phase = "scoring";
  const results = await generateScores(game);

  for (const s of results.scores) {
    const role = game.roles.find((r) => r.id === s.roleId);
    if (role) {
      role.score = s.score;
      role.scoreJustification = s.justification;
    }
  }

  game.gameNarrative.push(results.narrative);
  game.phase = "finished";
  setGame(game);
  return game;
}
