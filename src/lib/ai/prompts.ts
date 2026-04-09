import type { GameState, Role } from "../types";

export function scenarioGenerationPrompt(
  userScenario: string,
  playerCount: number
): string {
  return `You are the AI Gamemaster for PromptWars, a multiplayer prompt-engineering game.

The human gamemaster has described this scenario:
"${userScenario}"

Generate a game setup for ${playerCount} players. Keep ALL text short and punchy — this is shown on screen during a live game.

Respond with valid JSON matching this exact structure:

{
  "description": "1-2 sentences setting the scene. Be vivid but brief.",
  "rules": ["Array of 3-5 short world rules (one sentence each)"],
  "roles": [
    {
      "name": "Role Name",
      "description": "One sentence role description",
      "goal": "One sentence goal - specific and measurable",
      "secret": "One sentence secret, or null"
    }
  ]
}

CRITICAL: Every goal MUST directly conflict with at least one other player's goal. There should be NO easy win-win path — like Risk, one player's success must come at another's expense. Create a web of competing interests where achieving your goal requires undermining someone else's. Make roles distinct and memorable.`;
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

PREVIOUS ROUNDS:
${game.rounds.map((r) => {
  const actions = r.actions.map((a) => {
    const role = game.roles.find((rl) => rl.id === a.roleId);
    return `  ${role?.name}: ${a.actionText}`;
  }).join("\n");
  return `Round ${r.number}:
  Event: ${r.worldEvent?.text || "None"}
${actions}
  Result: ${r.summary || "No summary"}`;
}).join("\n")}

Generate the world event for this round. Keep it to 1-2 sentences max. The event MUST be a direct consequence of or reaction to what happened in previous rounds. The event should:
- Build on what players actually did — not feel random or disconnected
- ${phase === "early" ? "Introduce a new element or complication" : ""}
- ${phase === "middle" ? "Escalate tension, force difficult choices" : ""}
- ${phase === "climax" ? "Force resolution, make fence-sitting impossible" : ""}

Respond with JSON: { "text": "1-2 sentence world event" }`;
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

Based on your player's instructions, take an action. Write 2-3 sentences in third person describing what ${role.name} does AND what immediate effect it has. Keep it punchy and dramatic. The action must:
- Follow the player's instructions as closely as possible
- Be consistent with the world rules
- Show a visible consequence or reaction from the world/other characters

If the instructions are vague, do your best interpretation. If they ask for something impossible under the rules, have the character attempt it but face realistic consequences.

Respond with JSON: { "actionText": "2-3 sentences max" }`;
}

export function roundSummaryPrompt(game: GameState): string {
  const round = game.rounds[game.currentRound - 1];
  const roleNames = game.roles.map((r) => `${r.name} (${r.id}): Goal = "${r.goal}"`).join("\n");

  return `You are the AI Gamemaster for PromptWars. A round just finished. Summarize what happened and its CONSEQUENCES.

SCENARIO: ${game.scenario.description}
ROUND ${game.currentRound} of ${game.settings.rounds}

WORLD EVENT: ${round?.worldEvent?.text || "None"}

ACTIONS TAKEN:
${round?.actions.map((a) => {
  const role = game.roles.find((r) => r.id === a.roleId);
  return `${role?.name}: ${a.actionText}`;
}).join("\n")}

ROLES AND GOALS:
${roleNames}

Generate a round summary and per-player goal progress. The summary should highlight how actions IMPACTED each other and changed the situation. Goal progress should be a short status visible only to that player.

Respond with JSON:
{
  "summary": "2-3 sentences: what happened and what changed as a result. Focus on consequences and how players affected each other.",
  "goalProgress": [
    { "roleId": "2", "progress": "Short status, e.g. '1/3 tasks done — last one backfired' or 'Alliance forming but trust is shaky'" }
  ]
}`;
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

Score each player 0-10 based on how well they achieved their goal. Consider the full game arc. Reward consistent strategy, adaptability, and clever prompting.

Respond with JSON:
{
  "scores": [
    { "roleId": "...", "score": 8, "justification": "One sentence explanation" }
  ],
  "narrative": "2-3 sentence story of the entire game",
  "awards": [
    { "roleId": "...", "award": "Best Prompt", "reason": "One sentence" }
  ]
}`;
}
