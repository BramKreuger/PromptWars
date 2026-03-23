import { NextResponse } from "next/server";
import { createGame } from "@/lib/engine";
import type { CreateGameRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body: CreateGameRequest = await request.json();

    if (!body.scenario?.trim()) {
      return NextResponse.json(
        { error: "Scenario description is required" },
        { status: 400 }
      );
    }

    const game = await createGame({
      scenario: body.scenario,
      playerCount: Math.min(Math.max(body.playerCount || 4, 2), 8),
      rounds: Math.min(Math.max(body.rounds || 5, 3), 10),
      promptTime: Math.min(Math.max(body.promptTime || 90, 30), 300),
    });

    return NextResponse.json({ gameId: game.id, game });
  } catch (error) {
    console.error("Failed to create game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
