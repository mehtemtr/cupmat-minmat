import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import {
  getMinMatLeaderboard,
  addMinMatScore,
  getMinMatRewardPodium,
} from "@/lib/store/minmat-leaderboard-store";
import { registerMinMatGamePlayedByUserId } from "@/lib/store/gamification-store";
import type { MinMatScore } from "@/lib/store/minmat-leaderboard-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const type = searchParams.get("type") || "leaderboard";

  if (type === "podium") {
    const podium = await getMinMatRewardPodium();
    return NextResponse.json({ success: true, podium });
  }

  const leaderboard = await getMinMatLeaderboard(filter);
  return NextResponse.json(leaderboard);
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = (await request.json()) as Partial<MinMatScore>;

    if (
      typeof body.score !== "number" ||
      typeof body.level !== "number" ||
      typeof body.mode !== "string" ||
      !body.mode.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Geçersiz skor verisi" },
        { status: 400 },
      );
    }

    const scoreEntry: MinMatScore = {
      name: authResult.displayName,
      email: authResult.email || null,
      score: body.score,
      level: body.level,
      mode: body.mode,
      timestamp: body.timestamp || Date.now(),
      date:
        body.date ||
        new Date().toLocaleDateString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };

    await addMinMatScore(scoreEntry);
    await registerMinMatGamePlayedByUserId(
      authResult.userId,
      authResult.displayName,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MinMat leaderboard POST error:", error);
    return NextResponse.json({ success: false, error: "Kaydedilemedi" }, { status: 500 });
  }
}
