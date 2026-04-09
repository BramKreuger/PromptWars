# PromptWars

Multiplayer browser game where players write prompts to control AI agents in evolving scenarios.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Tone.js
- **Backend:** Custom Node.js server (`server.ts`) wrapping Next.js + Socket.io
- **AI:** OpenAI GPT-4o via `openai` SDK
- **Storage:** In-memory store (MVP), Redis planned for production
- **Language:** TypeScript throughout

## Project Structure
```
server.ts                   # Custom HTTP server (Next.js + Socket.io)
src/
  app/                      # Next.js App Router pages and API routes
    api/games/              # REST endpoints for game CRUD and actions
    [gameId]/[roleId]/      # Dynamic game view (gamemaster/player/spectator)
    create/                 # Game creation page
    join/                   # Join game page
  components/               # React components
    GamemasterDashboard.tsx # Full GM control panel (all phases)
    PlayerView.tsx          # Player game interface
    SpectatorView.tsx       # Read-only projection view
    ResultsScreen.tsx       # End-game scores, awards, narrative
    ActionCard.tsx          # Single action display
    WorldEventCard.tsx      # World event "news" card
    PromptEditor.tsx        # Prompt textarea with submit
    RoleCard.tsx            # Role info card
    Timer.tsx               # Countdown display
  hooks/
    useSocket.ts            # Socket.io client hook (game state, events)
    useSound.ts             # Tone.js 8-bit sound effects
  lib/
    ai/                     # OpenAI client, prompt templates, generation
    engine.ts               # Core game loop logic
    socket.ts               # Socket.io server singleton
    socket-events.ts        # Event name constants
    socket-handlers.ts      # Server-side socket event handlers
    timer.ts                # Server-authoritative countdown timer
    store.ts                # Game state storage
    types.ts                # Shared TypeScript types
```

## Key Patterns
- Game state is the single source of truth, stored in `lib/store.ts`
- State is sanitized per viewer role before broadcast (goals/prompts hidden)
- AI prompts are centralized in `lib/ai/prompts.ts`
- All AI calls go through `lib/ai/generate.ts`
- URL routing: `/{gameId}/0` = public game view (beamer), `/{gameId}/1` = gamemaster, `/{gameId}/2..N` = players
- Socket events defined in `lib/socket-events.ts`, handlers in `lib/socket-handlers.ts`
- Timer is server-authoritative with `setInterval`, auto-triggers round resolution

## Commands
- `npm run dev` — Start dev server (custom server via tsx)
- `npm run build` — Production build (Next.js)
- `npm run lint` — ESLint

## Design
- Retro pixel-art aesthetic (16-bit SNES era)
- Font: Press Start 2P
- CRT scanline overlay
- Color palette defined in globals.css CSS custom properties
- Sound: Tone.js square wave synths for 8-bit effects
