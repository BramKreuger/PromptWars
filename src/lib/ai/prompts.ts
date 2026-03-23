import type { GameState, Role } from "../types";

export function scenarioGenerationPrompt(
  userScenario: string,
  playerCount: number
): string {
  return `You are the AI Gamemaster for PromptWars, a multiplayer prompt-engineering game.

The human gamemaster has described this scenario:
"${userScenario}"

Generate a game setup for ${playerCount} players. Respond with valid JSON matching this exact structure:

{
  "description": "2-3 paragraph scenario description shown to all players. Set the scene vividly.",
  "rules": ["Array of 5-8 world rules that define what is possible and what constraints exist"],
  "roles": [
    {
      "name": "Role Name",
      "description": "1-2 sentence role description",
      "goal": "The player's personal goal - specific and measurable",
      "secret": "Optional secret information only this role knows, or null"
    }
  ]
}

Design goals that create interesting dynamics: some goals should overlap (creating alliances), others should conflict (creating tension). Each goal should be achievable but require strategic prompting. Make roles distinct and memorable.`;
}

export function worldEventPrompt(game: GameState): string {
  const roundNum = game.currentRound;
  const totalRounds = game.settings.rounds;
  const phase =
    roundNum <= Math.ceil(totalRounds * 0.3)
      ? "early"
      : roundNum >= totalRounds
        ? "climax"
        : "middle";

  return `You are the AI Gamemaster for PromptWars.

SCENARIO: ${game.scenario.description}
RULES: ${game.scenario.rules.join("; ")}
ROUND: ${roundNum} of ${totalRounds} (narrative phase: ${phase})

PREVIOUS EVENTS:
${game.rounds.map((r) => `Round ${r.number}: ${r.summary || "No summary yet"}`).join("\n")}

Generate the world event for this round. The event should:
- ${phase === "early" ? "Introduce a new element or complication" : ""}
- ${phase === "middle" ? "Escalate tension, force difficult choices" : ""}
- ${phase === "climax" ? "Force resolution, make fence-sitting impossible" : ""}

Respond with JSON: { "text": "2-3 sentence world event description" }`;
}

export function agentActionPrompt(
  game: GameState,
  role: Role,
  actionsThisRound: string[]
): string {
  return `You are an AI agent playing the role of "${role.name}" in PromptWars.

YOUR ROLE: ${role.description}
YOUR GOAL: ${role.goal}
${role.secret ? `YOUR SECRET: ${role.secret}` : ""}

SCENARIO: ${game.scenario.description}
RULES: ${game.scenario.rules.join("; ")}

CURRENT ROUND: ${game.currentRound} of ${game.settings.rounds}

${game.rounds[game.currentRound - 1]?.worldEvent ? `THIS ROUND'S WORLD EVENT: ${game.rounds[game.currentRound - 1].worldEvent!.text}` : ""}

ACTIONS ALREADY TAKEN THIS ROUND:
${actionsThisRound.length > 0 ? actionsThisRound.join("\n") : "None yet."}

YOUR PLAYER'S INSTRUCTIONS: "${role.currentPrompt}"

Based on your player's instructions, take an action. Write 1-3 short paragraphs in third person describing what ${role.name} does. The action must:
- Follow the player's instructions as closely as possible
- Be consistent with the world rules
- Be narrated in third person

If the instructions are vague, do your best interpretation. If they ask for something impossible under the rules, have the character attempt it but face realistic consequences.

Respond with JSON: { "actionText": "Your narration here" }`;
}

export function scoringPrompt(game: GameState): string {
  return `You are the AI Gamemaster scoring a completed PromptWars game.

SCENARIO: ${game.scenario.description}

FULL GAME HISTORY:
${game.rounds
  .map(
    (r) => `
Round ${r.number}:
  World Event: ${r.worldEvent?.text || "None"}
  Actions: ${r.actions.map((a) => `${a.roleId}: ${a.actionText}`).join("\n  ")}
  Summary: ${r.summary || "N/A"}`
  )
  .join("\n")}

ROLES AND GOALS:
${game.roles.map((r) => `${r.name} (${r.id}): Goal = "${r.goal}"`).join("\n")}

Score each player 0-10 based on how well they achieved their goal. Consider the full game arc, not just the final state. Reward consistent strategy, adaptability, and clever prompting.

Respond with JSON:
{
  "scores": [
    { "roleId": "...", "score": 8, "justification": "2-3 sentence explanation" }
  ],
  "narrative": "1 paragraph story of the entire game",
  "awards": [
    { "roleId": "...", "award": "Best Prompt", "reason": "..." }
  ]
}`;
}
