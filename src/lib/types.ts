export interface GameSettings {
  rounds: number;
  promptTime: number;
  timerVisible: boolean;
  countdownEnabled: boolean;
  promptHistory: boolean;
  showActionsRealtime: boolean;
  spectatorMode: boolean;
  soundEnabled: boolean;
}

export interface GameState {
  id: string;
  scenario: {
    description: string;
    rules: string[];
    sceneImageUrl: string | null;
  };
  settings: GameSettings;
  roles: Role[];
  rounds: Round[];
  currentRound: number;
  phase: "setup" | "lobby" | "prompting" | "resolving" | "summary" | "scoring" | "finished";
  gameNarrative: string[];
  createdAt: number;
}

export interface Role {
  id: string; // unique join code
  name: string;
  description: string;
  goal: string;
  secret: string | null;
  avatarUrl: string | null;
  playerConnected: boolean;
  currentPrompt: string | null;
  promptHistory: string[];
  score: number | null;
  scoreJustification: string | null;
}

export interface Round {
  number: number;
  worldEvent: WorldEvent | null;
  actions: Action[];
  summary: string | null;
}

export interface WorldEvent {
  text: string;
  imageUrl: string | null;
  injectedBy: "ai" | "gamemaster";
}

export interface Action {
  roleId: string;
  promptUsed: string;
  actionText: string;
  imageUrl: string | null;
}

export interface CreateGameRequest {
  scenario: string;
  playerCount: number;
  rounds: number;
  promptTime: number;
}

export interface CreateGameResponse {
  gameId: string;
  game: GameState;
}
