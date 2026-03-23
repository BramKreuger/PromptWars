import { getAnthropicClient } from "./client";
import {
  scenarioGenerationPrompt,
  worldEventPrompt,
  agentActionPrompt,
  scoringPrompt,
} from "./prompts";
import type { GameState, Role } from "../types";

const MODEL = "claude-sonnet-4-20250514";

async function callAI(systemPrompt: string): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: "Generate the requested output." }],
    system: systemPrompt,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock ? textBlock.text : "";
}

function parseJSON<T>(text: string): T {
  // Extract JSON from potential markdown code fences
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  return JSON.parse(match[1]!.trim());
}

export async function generateScenario(
  userScenario: string,
  playerCount: number
): Promise<{
  description: string;
  rules: string[];
  roles: { name: string; description: string; goal: string; secret: string | null }[];
}> {
  const prompt = scenarioGenerationPrompt(userScenario, playerCount);
  const result = await callAI(prompt);
  return parseJSON(result);
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
