import { NextResponse } from "next/server";
import {
  getMinMatLeaderboard,
  addMinMatScore,
  type MinMatScore,
} from "@/lib/store/minmat-leaderboard-store";
import { awardPredictionRightByName, registerMinMatGamePlayed } from "@/lib/store/gamification-store";

export async function GET() {
  try {
    const scores = await getMinMatLeaderboard();
    return NextResponse.json({ leaderboard: scores });
  } catch (error) {
    console.error("GET MinMat Leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MinMatScore>;

    if (!body.name || typeof body.score !== "number" || typeof body.level !== "number" || !body.mode) {
      return NextResponse.json({ error: "Invalid score payload" }, { status: 400 });
    }

    const entry: MinMatScore = {
      name: body.name.trim().substring(0, 30),
      score: body.score,
      level: body.level,
      mode: body.mode,
      date: body.date ?? new Date().toLocaleDateString("tr-TR"),
    };

    await addMinMatScore(entry);

    // Register that they played a MinMat game today!
    await registerMinMatGamePlayed(entry.name);

    // If they score >= 30, award 1 prediction change key dynamically!
    let keyAwarded = false;
    let awardMessage = "";
    if (entry.score >= 30) {
      const res = await awardPredictionRightByName(entry.name, 1);
      keyAwarded = res.success;
      awardMessage = res.message;
    }

    return NextResponse.json({
      success: true,
      entry,
      keyAwarded,
      awardMessage
    });
  } catch (error) {
    console.error("POST MinMat Leaderboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
