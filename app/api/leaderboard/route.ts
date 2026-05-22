import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import {
  getLeaderboard,
  upsertSubmission,
} from "@/lib/store/leaderboard-store";
import type { PredictionSubmission } from "@/lib/types/tournament";

export async function GET() {
  return NextResponse.json({ leaderboard: await getLeaderboard() });
}

export async function POST(request: Request) {
  const authResult = await requireApiAuth();
  if (!authResult.ok) {
    return authResult.response;
  }

  const body = (await request.json()) as Partial<PredictionSubmission>;

  if (!body.displayName || typeof body.points !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.points < 0) {
    return NextResponse.json(
      { error: "Puanlar azaltılamaz veya silinemez" },
      { status: 403 },
    );
  }

  const store = await getLeaderboard();
  const existing = store.find((s) => s.userId === authResult.userId);

  if (existing && body.points < existing.points) {
    return NextResponse.json(
      { error: "Puanlar azaltılamaz. Mevcut puanınız korunur." },
      { status: 403 },
    );
  }

  const entry: PredictionSubmission = {
    userId: authResult.userId,
    displayName: authResult.displayName,
    matchPredictions: body.matchPredictions ?? existing?.matchPredictions ?? {},
    points: Math.max(existing?.points ?? 0, body.points),
    groupsComplete: body.groupsComplete ?? existing?.groupsComplete ?? false,
    submittedAt: new Date().toISOString(),
  };

  await upsertSubmission(entry);
  return NextResponse.json({ success: true, entry });
}
