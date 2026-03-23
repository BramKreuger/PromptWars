# PRD: PromptWars - GenAI Game Simulator

## 1. Product Overview

PromptWars is a multiplayer browser-based game where participants don't control their characters directly. Instead, they write prompts that instruct an AI to play on their behalf. A gamemaster sets up a scenario (geopolitical crisis, office negotiation, historical event, etc.), assigns roles with individual goals, and the AI executes each player's strategy round by round while world events unfold.

The game is designed for workshop, training, and team-building contexts. It runs in the browser, requires no app install, and uses a Mentimeter-style join flow (URL + unique code).

### Core differentiator

Players compete through prompt engineering. The skill gap is not gaming reflexes or trivia knowledge, it's the ability to clearly instruct an AI agent to act in your interest within a complex, evolving scenario.

### Design principles

- **Retro aesthetic throughout.** Pixel art, 8-bit sound effects, low-res visuals. This is a deliberate design choice: it keeps generation costs low, sets visual expectations, and gives the game a distinct personality.
- **Mobile-first, desktop-friendly.** Players join on their phones. The gamemaster typically uses a desktop/laptop.
- **Session-based, no accounts.** Games are ephemeral. No sign-up, no persistent profiles. Join via URL + code, play, done.
- **Time-boxed by design.** Every game has a known duration. The system ensures games end on time and produce a winner.

---

## 2. User Roles

### Gamemaster (ID: 0)
- Creates and configures the game
- Can edit AI-generated scenarios, roles, goals, and rules before the game starts
- Has a dashboard view during the game showing all prompts, upcoming world events, and the option to modify/inject world events
- Can pause, resume, or end the game early
- Always joins at `/{game_id}/0`

### Participant (ID: unique code)
- Joins via `/{game_id}/{unique_code}`
- Selects an available role
- Writes and refines prompts each round
- Watches their AI agent act on their behalf
- Sees their own goal, public game state, and round results

### Spectator (optional)
- Joins via `/{game_id}/spectator`
- Read-only view of the game board, ideal for projection on a big screen during workshops
- Sees all actions, world events, and scores but no individual prompts or goals

---

## 3. Game Setup Flow

### 3.1 Scene creation

The gamemaster describes the scenario. Input methods:
- **Text input:** Free-form description of the situation, context, stakes
- **Voice input:** Speech-to-text option. The gamemaster talks the scenario into the system and it gets transcribed and used as the scene prompt

The AI then generates:
- A **short scenario description** (2-3 paragraphs, shown to all players)
- A **set of world rules** defining what is realistic, what actions are possible, what constraints exist
- A **pixel-art scene illustration** (header image for the game board)

### 3.2 Role and goal generation

Based on the scenario and the number of participants (set by gamemaster), the AI generates:
- One **role** per participant, each with:
  - A name and short description
  - A **pixel-art avatar** (small icon, 64x64 or 128x128)
  - A **unique join code** (short alphanumeric, e.g., `A7X2`)
  - A **personal goal** (visible only to that player)
  - Optional: a **secret** or piece of information only that role knows

Goals can overlap. Some players may share objectives, creating natural alliances. Other goals may directly conflict, creating tension. The AI should balance this.

### 3.3 Review and edit

Before launching the game, the gamemaster can:
- Edit any generated text (scenario, rules, role descriptions, goals)
- Regenerate individual roles, goals, or the entire scenario
- Adjust the number of roles
- Reorder roles
- Toggle game settings (see 3.4)

### 3.4 Game settings

| Setting | Default | Options |
|---|---|---|
| Number of rounds | 5 | 3-10 |
| Prompt editing time per round | 90 seconds | 30-300 seconds, or unlimited |
| Round timer visible to players | Yes | Yes / No |
| Enable countdown timer | Yes | Yes / No (if No, gamemaster manually advances rounds) |
| Allow prompt history (players see their previous prompts) | Yes | Yes / No |
| Show other players' actions in real-time | Yes | Yes / No (if No, all actions revealed at end of round) |
| Enable spectator mode | No | Yes / No |
| Enable sound effects | Yes | Yes / No |

### 3.5 Time budget calculator

To help the gamemaster plan, the setup screen shows an estimated total game duration:

```
Total time = (prompt_edit_time + estimated_action_resolution_time) * number_of_rounds
```

Where `estimated_action_resolution_time` = number_of_participants * ~15 seconds (AI generation + animation) + world event time (~20 seconds per event).

Example: 6 players, 5 rounds, 90s edit time:
- Per round: 90s editing + (6 * 15s actions) + 20s world event = ~200s
- Total: ~17 minutes

This estimate is shown during setup so the gamemaster can adjust settings to fit their time slot.

---

## 4. Game Flow (Per Round)

### 4.1 World event phase

Each round opens with a world event: something that changes the situation. This is generated by the AI gamemaster based on the current game state, what happened in previous rounds, and the overall narrative arc.

The **human gamemaster** sees the upcoming world event during the prompt editing phase (before it's shown to players) and can:
- Approve it as-is
- Edit the text
- Replace it with a custom event
- Skip it (no world event this round)

World events are presented as a pixel-art "news card" or "broadcast" with a short text and a small generated illustration.

### 4.2 Prompt editing phase

All participants simultaneously write or update their prompt. They see:
- The scenario description and rules
- Their role and personal goal
- The current game state (what has happened so far)
- The latest world event
- Their previous prompt (if enabled)
- A countdown timer (if enabled)

The prompt is their instruction to their AI agent. Examples:
- "Try to form an alliance with the trade minister. Offer a 10% tariff reduction in exchange for port access."
- "Stay quiet this round. Observe what others do. If anyone attacks our position, respond firmly but don't escalate."
- "Go all-in. Propose a merger to the board and frame it as their idea."

When the timer runs out (or when the gamemaster manually advances), all prompts lock.

### 4.3 Action resolution phase

Roles are picked in **random order** each round. One by one, each AI agent acts based on its player's prompt, the current game state, the role's goal, and the world rules.

Each action is:
1. Generated by the AI (the agent "decides" what to do based on the prompt)
2. Displayed to all players as a short narrative with a pixel-art action card
3. Accompanied by a retro sound effect matching the action type

The sequential order is intentional. Later players see the results of earlier actions, which means the random draw order matters. This creates an element of luck that balances pure prompt skill.

Between actions, the AI gamemaster can insert **reactive world events** if the situation warrants it (e.g., if two players' actions create an unexpected outcome, the world reacts). The human gamemaster can also trigger or block these.

### 4.4 Round summary

After all actions resolve, a brief round summary is shown:
- What happened this round (narrative recap)
- Updated game state
- Optional: a "standings" indicator showing how close each player is to their goal (without revealing the goals themselves). This could be a simple progress bar or emoji-based indicator.

---

## 5. Ending the Game and Declaring a Winner

The game must end on time and produce a clear result. Multiple mechanisms work together:

### 5.1 Round cap with narrative escalation

The AI gamemaster knows the total number of rounds and structures the narrative accordingly:
- **Early rounds (1-2):** Setup, exploration, relationship building
- **Middle rounds:** Rising tension, complications, forced choices
- **Final round:** Crisis or climax. The world event for the final round should force resolution and make fence-sitting impossible.

### 5.2 Goal scoring

After the final round, the AI evaluates each player's performance against their personal goal. Scoring:
- **0-10 scale per player**, with a 2-3 sentence justification explaining what they achieved and what they missed
- If goals overlap, a **collective score** is also calculated
- The AI considers the full game history: not just the final state, but how the player navigated the scenario

### 5.3 Results screen

The results screen reveals:
1. **All goals** (now visible to everyone, creating an "aha" moment)
2. **Individual scores** with AI justification
3. **A winner** (highest individual score) and optional "awards" for notable play:
   - "Best Prompt" (most effective single prompt)
   - "Plot Twist" (most unexpected action)
   - "Diplomat" (most successful negotiator)
   - etc.
4. A **game narrative summary**: the AI writes a 1-paragraph story of the entire game as it unfolded
5. Pixel-art "victory screen" and "game over" animation with retro sound

### 5.4 Early resolution

If the AI gamemaster determines that all goals are resolved (met or failed) before the final round, it can recommend early ending. The human gamemaster decides whether to accept this or continue.

### 5.5 Tiebreaking

If scores are tied, the AI considers:
1. Consistency of strategy (did the player adapt well, or flail?)
2. Impact on other players' outcomes
3. Creativity of approach

If still tied, it's a shared victory. That's fine.

---

## 6. AI Architecture

### 6.1 AI Gamemaster (system-level)

Responsibilities:
- Generate scenarios, roles, goals, rules from the scene description
- Generate world events that escalate the narrative toward resolution
- Evaluate actions in context of world rules and game state
- Score players at game end
- Maintain narrative coherence across rounds

The AI gamemaster maintains a **game state document** that is updated after each action. This document is the single source of truth and is included in every AI call as context.

### 6.2 AI Agents (per role)

Each role has its own AI agent. Per action, the agent receives:
- The role description and personal goal
- The current game state
- The player's prompt for this round
- The world rules
- What has happened so far this round (actions by roles that acted before this one)

The agent generates a short action (1-3 paragraphs) describing what the character does. The action must be:
- Consistent with the player's prompt (the agent follows instructions, it doesn't go rogue)
- Consistent with the world rules (no impossible actions)
- Narrated in third person

If a player's prompt is vague or contradictory, the agent does its best interpretation but may note the ambiguity in the action description ("Unsure of their leader's true intentions, the minister hesitated before...")

### 6.3 Prompt structure

All AI calls use structured system prompts:

**Gamemaster system prompt includes:**
- Game scenario and rules
- Full game state (updated per action)
- Round number, total rounds, narrative phase (early/middle/climax)
- List of all roles and their goals (gamemaster knows everything)

**Agent system prompt includes:**
- Role description and personal goal
- World rules
- Current game state (public information only)
- Actions taken so far this round
- Player's prompt

### 6.4 Model usage

- **Scenario/role generation:** Sonnet 4 (creative, one-time cost per game)
- **World events:** Sonnet 4 (short, infrequent)
- **Agent actions:** Sonnet 4 (short outputs, frequent, keep concise)
- **Scoring:** Sonnet 4 (one-time cost at game end)
- **Image generation:** Pixel-art style (small, low resolution), generated via a dedicated image endpoint or pre-rendered sprite system

### 6.5 Context management

The game state document grows each round. To keep within context limits:
- Summarize earlier rounds progressively (full detail for current and previous round, summaries for older rounds)
- Keep world rules and role descriptions constant (not re-summarized)
- Cap action descriptions at ~200 words each

---

## 7. Visual and Audio Design

### 7.1 Visual style

**Retro pixel art throughout.** Think 16-bit SNES/Mega Drive era.

Generated visuals:
- **Scene illustration:** ~256x256 pixel art, shown as game header
- **Character avatars:** 64x64 or 128x128 pixel art portraits
- **Action cards:** Small pixel-art illustrations per action, ~128x128
- **World event cards:** "Breaking news" style card with pixel-art icon
- **Victory screen:** Larger pixel-art celebration scene

UI elements (not generated, designed as assets):
- Pixel-art UI chrome (borders, buttons, panels)
- Retro font (e.g., Press Start 2P or similar)
- CRT scanline overlay (subtle, optional)
- Animated pixel-art transitions between phases

### 7.2 Audio

All audio is retro-style, implemented via **Tone.js** or a pre-made 8-bit sound pack. No AI-generated audio.

Sound effects:
- **Round start:** chiptune fanfare
- **Timer ticking:** subtle 8-bit tick (last 10 seconds: faster, more urgent)
- **Prompt locked:** confirmation bleep
- **Action resolving:** typing/processing sound, then a resolution chime
- **World event:** alarm/broadcast jingle
- **Victory:** chiptune victory theme
- **Game over:** short chiptune outro

Optional: ambient 8-bit background music (low-key, loopable) during the prompt editing phase.

---

## 8. Technical Architecture

### 8.1 Stack (recommended)

- **Frontend:** React (or Next.js), Tailwind CSS, Tone.js for audio
- **Backend:** Node.js with WebSocket support (Socket.io or native WS)
- **AI:** Anthropic API (Claude Sonnet 4 via `/v1/messages`)
- **Image generation:** TBD based on cost/quality tradeoff. Options: dedicated pixel-art model, DALL-E with strong style prompting, or pre-rendered sprite system with AI-selected compositions
- **Database:** Redis or similar for ephemeral game state (games don't persist after session)
- **Hosting:** Single server or serverless (Vercel + serverless functions + Redis)

### 8.2 URL routing

```
/                           → Landing page / create game
/create                     → Gamemaster setup flow
/{game_id}/0                → Gamemaster dashboard (always ID 0)
/{game_id}/{unique_code}    → Player view
/{game_id}/spectator        → Spectator view (if enabled)
```

### 8.3 Real-time communication

WebSockets for:
- Syncing game state to all connected clients
- Broadcasting actions as they resolve (streaming the AI output)
- Timer synchronization
- Gamemaster controls (pause, advance, inject events)

### 8.4 Game state model

```
GameState {
  id: string
  scenario: {
    description: string
    rules: string[]
    scene_image_url: string
  }
  settings: GameSettings
  roles: Role[]
  rounds: Round[]
  current_round: number
  phase: "setup" | "prompting" | "resolving" | "summary" | "scoring" | "finished"
  game_narrative: string[]  // running summary for context management
}

Role {
  id: string               // unique join code
  name: string
  description: string
  goal: string
  secret: string | null
  avatar_url: string
  player_connected: boolean
  current_prompt: string | null
  score: number | null
}

Round {
  number: number
  world_event: WorldEvent | null
  actions: Action[]         // ordered by resolution sequence
  summary: string
}

WorldEvent {
  text: string
  image_url: string | null
  injected_by: "ai" | "gamemaster"
}

Action {
  role_id: string
  prompt_used: string
  action_text: string
  image_url: string | null
}
```

---

## 9. Scope and Phasing

### Phase 1: Core game loop (MVP)
- Gamemaster creates game with text input
- AI generates scenario, roles, goals, rules
- Players join via URL + code, select roles
- Prompt editing with timer
- Sequential action resolution
- World events (AI-generated, gamemaster can approve/edit)
- Basic scoring and results screen
- Retro UI with pixel font and 8-bit sound effects
- No generated images (use placeholder pixel-art icons)

### Phase 2: Visual polish
- AI-generated pixel-art scene illustrations
- AI-generated character avatars
- Action cards with generated visuals
- Victory screen animations
- Spectator mode
- Voice input for scene creation

### Phase 3: Advanced features
- Game templates (pre-made scenarios for common workshop themes)
- Custom role creation by gamemaster
- Export game transcript as PDF or shareable link
- Replay mode (watch a completed game back)
- Multiple languages
- Persistent game library (save and re-run scenarios)

---

## 10. Constraints and Risks

| Risk | Mitigation |
|---|---|
| AI generation latency during action resolution makes the game feel slow | Keep action outputs short (~100-150 words). Stream output to clients. Show pixel-art "thinking" animation while generating. |
| Context window overflow in long games with many players | Progressive summarization of older rounds. Cap at 8 players and 10 rounds. |
| Players write harmful or nonsensical prompts | AI agents operate within world rules. Agents can "refuse" unrealistic actions gracefully within the narrative ("The general considered the absurd order, then chose a more prudent path..."). Add optional content filter. |
| Game doesn't feel fair (random action order advantage) | This is by design and adds a luck element. Communicate it clearly in the rules. Vary the order each round. |
| AI scoring feels arbitrary | Show reasoning for each score. Let gamemaster override scores if needed. |
| Total game duration hard to predict | Time budget calculator in setup. Gamemaster can skip/shorten phases. Add a hard time limit option that forces final scoring when reached. |

---

## 11. Success Metrics

- **Completion rate:** % of games that reach the scoring screen (target: >90%)
- **Average game duration vs. estimate:** Should be within 20% of the time budget calculator's prediction
- **Player engagement:** Average number of prompt edits per player per round (>1 indicates active engagement)
- **Replayability:** % of gamemasters who create a second game within 30 days
- **Workshop fit:** Post-game survey score on "this was a useful learning experience" (target: >4/5)

---

## 12. Open Questions

1. **Image generation approach:** Dedicated pixel-art model vs. general model with style prompting vs. pre-rendered sprite library with AI composition? Cost and latency tradeoffs need testing.
2. **Maximum players:** What's the practical limit before action resolution takes too long? Likely 8-10, but needs testing with real latency data.
3. **Prompt visibility:** Should players ever see each other's prompts? Perhaps as a post-game reveal? This could be a powerful learning moment in training contexts.
4. **Monetization model:** Per-game pricing, subscription, or bundled with AI-AT training packages?
5. **Naming:** "PromptWars" is a working title. Alternatives worth considering.
