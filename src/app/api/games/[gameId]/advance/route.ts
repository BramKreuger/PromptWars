import { NextResponse } from "next/server";
import { advanceToPrompting, resolveRound, scoreGame } from "@/lib/engine";
import { getGame } from "@/lib/store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const game = getGame(gameId);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  try {
    let updated;

    switch (game.phase) {
      case "lobby":
      case "summary":
        updated = await advanceToPrompting(gameId);
        break;
      case "prompting":
        updated = await resolveRound(gameId);
        break;
      case "resolving":
        // Already resolving, wait
        return NextResponse.json({ game });
      case "scoring":
      case "finished":
        return NextResponse.json({ game });
      default:
        updated = await advanceToPrompting(gameId);
    }

    // If we just finished the last round's summary, score the game
    if (updated.phase === "summary" && updated.currentRound >= updated.settings.rounds) {
      updated = await scoreGame(gameId);
    }

    return NextResponse.json({ game: updated });
  } catch (error) {
    console.error("Failed to advance game:", error);
    return NextResponse.json(
      { error: "Failed to advance game" },
      { status: 500 }
    );
  }
}
