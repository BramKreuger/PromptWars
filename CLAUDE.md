# PromptWars

Multiplayer browser game where players write prompts to control AI agents in evolving scenarios.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Tone.js
- **Backend:** Next.js API routes + Socket.io for real-time
- **AI:** Anthropic Claude Sonnet 4 via `@anthropic-ai/sdk`
- **Storage:** In-memory store (MVP), Redis planned for production
- **Language:** TypeScript throughout

## Project Structure
```
src/
  app/                    # Next.js App Router pages and API routes
    api/games/            # REST endpoints for game CRUD and actions
    [gameId]/[roleId]/    # Dynamic game view (gamemaster/player/spectator)
    create/               # Game creation page
    join/                 # Join game page
  lib/
    ai/                   # Anthropic API client, prompt templates, generation
    engine.ts             # Core game loop logic
    store.ts              # Game state storage
    types.ts              # Shared TypeScript types
```

## Key Patterns
- Game state is the single source of truth, stored in `lib/store.ts`
- AI prompts are centralized in `lib/ai/prompts.ts`
- All AI calls go through `lib/ai/generate.ts`
- URL routing: `/{gameId}/0` = gamemaster, `/{gameId}/{code}` = player, `/{gameId}/spectator` = spectator

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint

## Design
- Retro pixel-art aesthetic (16-bit SNES era)
- Font: Press Start 2P
- CRT scanline overlay
- Color palette defined in globals.css CSS custom properties
