import { getOpenAIClient } from "./client";
import {
  scenarioGenerationPrompt,
  worldEventPrompt,
  agentActionPrompt,
  roundSummaryPrompt,
  scoringPrompt,
} from "./prompts";
import type { GameState, Role } from "../types";
import { getGame, setGame } from "../store";

const MODEL = "gpt-4o";

async function callAI(systemPrompt: string): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate the requested output." },
    ],
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Generate an image with DALL-E 3. Returns the URL or null on failure.
 * This should be called fire-and-forget — never block game flow on it.
 */
async function generateImage(prompt: string): Promise<string | null> {
  try {
    const client = getOpenAIClient();
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: `Retro 16-bit pixel art game scene, SNES era style: ${prompt}. Vibrant colors, no text or UI elements.`,
      n: 1,
      size: "1792x1024",
    });
    return response.data?.[0]?.url || null;
  } catch (err) {
    console.error("Image generation failed:", err);
    return null;
  }
}

/**
 * Fire-and-forget: generate a scene image and patch it into the game state.
 * Broadcasts updated state via the provided callback when done.
 */
function generateSceneImageAsync(
  gameId: string,
  description: string,
  onUpdate?: () => void,
): void {
  generateImage(description).then((url) => {
    if (!url) return;
    const game = getGame(gameId);
    if (!game) return;
    game.scenario.sceneImageUrl = url;
    setGame(game);
    onUpdate?.();
  });
}

/**
 * Fire-and-forget: generate a world event image and patch it into the round.
 */
function generateEventImageAsync(
  gameId: string,
  roundNumber: number,
  description: string,
  onUpdate?: () => void,
): void {
  generateImage(description).then((url) => {
    if (!url) return;
    const game = getGame(gameId);
    if (!game) return;
    const round = game.rounds.find((r) => r.number === roundNumber);
    if (round?.worldEvent) {
      round.worldEvent.imageUrl = url;
      setGame(game);
      onUpdate?.();
    }
  });
}

function parseJSON<T>(text: string): T {
  // Extract JSON from potential markdown code fences
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  return JSON.parse(match[1]!.trim());
}

export async function generateScenario(
  userScenario: string,
  playerCount: number,
  onImageReady?: () => void,
): Promise<{
  description: string;
  rules: string[];
  roles: { name: string; description: string; goal: string; secret: string | null }[];
  gameId?: string;
}> {
  const prompt = scenarioGenerationPrompt(userScenario, playerCount);
  const result = await callAI(prompt);
  return parseJSON(result);
}

/**
 * Kick off scene image generation in the background.
 * Call this after the game is saved to the store.
 */
export function startSceneImageGeneration(
  gameId: string,
  description: string,
  onUpdate?: () => void,
): void {
  generateSceneImageAsync(gameId, description, onUpdate);
}

/**
 * Kick off world event image generation in the background.
 */
export function startEventImageGeneration(
  gameId: string,
  roundNumber: number,
  scenarioDescription: string,
  eventText: string,
  onUpdate?: () => void,
): void {
  generateEventImageAsync(
    gameId,
    roundNumber,
    `${scenarioDescription}. Current event: ${eventText}`,
    onUpdate,
  );
}

export async function generateWorldEvent(
  game: GameState
): Promise<{ text: string }> {
  const prompt = worldEventPrompt(game);
  const result = await callAI(prompt);
  return parseJSON(result);
}

export async function generateAction(
  game: GameState,
  role: Role,
  actionsThisRound: string[]
): Promise<{ actionText: string }> {
  const prompt = agentActionPrompt(game, role, actionsThisRound);
  const result = await callAI(prompt);
  return parseJSON(result);
}

export async function generateRoundSummary(
  game: GameState
): Promise<{
  summary: string;
  goalProgress: { roleId: string; progress: string }[];
}> {
  const prompt = roundSummaryPrompt(game);
  const result = await callAI(prompt);
  return parseJSON(result);
}

export async function generateScores(
  game: GameState
): Promise<{
  scores: { roleId: string; score: number; justification: string }[];
  narrative: string;
  awards: { roleId: string; award: string; reason: string }[];
}> {
  const prompt = scoringPrompt(game);
  const result = await callAI(prompt);
  return parseJSON(result);
}
