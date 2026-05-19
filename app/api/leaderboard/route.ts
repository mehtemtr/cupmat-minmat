import { NextResponse } from "next/server";
import {
  getLeaderboard,
  upsertSubmission,
} from "@/lib/store/leaderboard-store";
import type { PredictionSubmission } from "@/lib/types/tournament";

export async function GET() {
  return NextResponse.json({ leaderboard: await getLeaderboard() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<PredictionSubmission>;

  if (!body.displayName || typeof body.points !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const entry: PredictionSubmission = {
    userId: body.userId ?? `user-${Date.now()}`,
    displayName: body.displayName,
    matchPredictions: body.matchPredictions ?? {},
    points: body.points,
    groupsComplete: body.groupsComplete ?? false,
    submittedAt: new Date().toISOString(),
  };

  await upsertSubmission(entry);
  return NextResponse.json({ success: true, entry });
}
