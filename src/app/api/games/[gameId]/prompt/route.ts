import { NextResponse } from "next/server";
import { getGame, setGame } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const game = getGame(gameId);

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  if (game.phase !== "prompting") {
    return NextResponse.json(
      { error: "Not in prompting phase" },
      { status: 400 }
    );
  }

  const { roleId, prompt } = await request.json();

  const role = game.roles.find((r) => r.id === roleId);
  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  role.currentPrompt = prompt;
  setGame(game);

  return NextResponse.json({ success: true });
}
