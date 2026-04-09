import { nanoid } from "nanoid";
import type { GameState, GameSettings, CreateGameRequest } from "./types";
import { getGame, setGame } from "./store";
import {
  generateScenario,
  generateWorldEvent,
  generateAction,
  generateRoundSummary,
  generateScores,
  startSceneImageGeneration,
  startEventImageGeneration,
} from "./ai/generate";

// Role IDs: 0 = public game view, 1 = gamemaster, 2+ = players

// Callback for broadcasting state updates (set by socket-handlers)
let broadcastCallback: ((gameId: string) => void) | null = null;

export function setBroadcastCallback(cb: (gameId: string) => void): void {
  broadcastCallback = cb;
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

  const roles = scenario.roles.map((r, index) => ({
    id: String(index + 2), // Players start at 2 (0=game view, 1=GM)
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
    goalProgress: null,
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
    awards: [],
    paused: false,
    createdAt: Date.now(),
  };

  setGame(game);

  // Fire-and-forget: generate scene image in background
  startSceneImageGeneration(gameId, scenario.description, () => {
    broadcastCallback?.(gameId);
  });

  return game;
}

export async function advanceToPrompting(gameId: string): Promise<GameState> {
  const game = getGame(gameId);
  if (!game) throw new Error("Game not found");

  game.currentRound++;
  game.phase = "prompting";

  // Generate world event text (fast, text only)
  const event = await generateWorldEvent(game);
  const round = {
    number: game.currentRound,
    worldEvent: { text: event.text, imageUrl: null as string | null, injectedBy: "ai" as const },
    actions: [],
    summary: null,
  };
  game.rounds.push(round);

  setGame(game);

  // Fire-and-forget: generate event image in background
  startEventImageGeneration(
    gameId,
    game.currentRound,
    game.scenario.description,
    event.text,
    () => { broadcastCallback?.(gameId); },
  );

  return game;
}

export async function resolveRound(
  gameId: string,
  onActionResolved?: (action: import("./types").Action, roleName: string) => void,
): Promise<GameState> {
  const game = getGame(gameId);
  if (!game) throw new Error("Game not found");

  game.phase = "resolving";
  setGame(game);
  const round = game.rounds[game.currentRound - 1];

  // Shuffle roles for random action order
  const shuffledRoles = [...game.roles].sort(() => Math.random() - 0.5);
  const actionDescriptions: string[] = [];

  for (const role of shuffledRoles) {
    const hadPrompt = !!role.currentPrompt;
    const prompt = role.currentPrompt || "(no instructions — idle)";

    let actionText: string;
    if (!hadPrompt) {
      actionText = `${role.name} stood around doing nothing, watching events unfold without intervening.`;
    } else {
      try {
        const result = await generateAction(game, role, actionDescriptions);
        actionText = result.actionText;
      } catch {
        actionText = `${role.name} hesitated, unsure how to proceed in this moment...`;
      }
    }

    const action = {
      roleId: role.id,
      promptUsed: prompt,
      actionText,
      imageUrl: null,
    };

    round.actions.push(action);
    actionDescriptions.push(`${role.name}: ${actionText}`);

    // Save prompt to history
    if (hadPrompt) {
      role.promptHistory.push(role.currentPrompt!);
    }
    role.currentPrompt = null;

    setGame(game);
    onActionResolved?.(action, role.name);
  }

  // Generate round summary with impact analysis and goal progress
  try {
    const summaryResult = await generateRoundSummary(game);
    round.summary = summaryResult.summary;

    for (const gp of summaryResult.goalProgress) {
      const role = game.roles.find((r) => r.id === gp.roleId);
      if (role) {
        role.goalProgress = gp.progress;
      }
    }
  } catch {
    round.summary = null;
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
  game.awards = results.awards || [];
  game.phase = "finished";
  setGame(game);
  return game;
}
