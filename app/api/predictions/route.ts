import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { getOrCreateProfile } from "@/lib/store/gamification-store";
import { getLeaderboard, upsertSubmission } from "@/lib/store/leaderboard-store";
import { generateGroupFixtures } from "@/lib/fixtures";
import type { PredictionSubmission, MatchPrediction } from "@/lib/types/tournament";

export async function GET() {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const { userId } = authResult;
    const profile = await getOrCreateProfile(userId, authResult.displayName);
    const leaderboard = await getLeaderboard();
    const submission = leaderboard.find((s) => s.userId === userId);

    return NextResponse.json({
      success: true,
      profile,
      predictions: submission?.matchPredictions || {},
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await request.json();
    const { predictions, singleMatchId } = body;
    const userId = authResult.userId;
    const displayName = authResult.displayName;

    if (!predictions) {
      return NextResponse.json({ error: "Geçersiz istek parametreleri" }, { status: 400 });
    }

    const profile = await getOrCreateProfile(userId, displayName);
    const leaderboard = await getLeaderboard();
    const existingSubmission = leaderboard.find((s) => s.userId === userId);

    const fixtures = generateGroupFixtures();

    if (singleMatchId) {
      if (!profile.genelTahminHakkiKullanildi) {
        return NextResponse.json({
          error: "Öncelikle turnuva başı genel tahmin hakkınızı kullanarak ilk tahminlerinizi kaydetmelisiniz."
        }, { status: 400 });
      }

      if (profile.tahminGuncellemeHakki <= 0) {
        return NextResponse.json({
          error: "Yetersiz tahmin değiştirme hakkı! Değiştirme hakkı kazanmak için MinMat portalında rekor kırmalısınız."
        }, { status: 400 });
      }

      const targetMatch = fixtures.find((m) => m.id === singleMatchId);
      if (!targetMatch) {
        return NextResponse.json({ error: "Maç bulunamadı." }, { status: 404 });
      }

      const matchDate = new Date(`${targetMatch.date}T${targetMatch.time || "00:00"}:00Z`);
      const now = new Date();
      if (now >= matchDate) {
        return NextResponse.json({
          error: "Maç günü veya saati geldiği için bu maça ait tahmin değiştirilemez!"
        }, { status: 400 });
      }

      profile.tahminGuncellemeHakki = Math.max(0, profile.tahminGuncellemeHakki - 1);

      const newScore = predictions[singleMatchId];
      if (!newScore || typeof newScore.home !== "number" || typeof newScore.away !== "number") {
        return NextResponse.json({ error: "Geçersiz maç skor formatı." }, { status: 400 });
      }

      const currentPredictions = existingSubmission?.matchPredictions || {};
      currentPredictions[singleMatchId] = {
        home: newScore.home,
        away: newScore.away,
        source: "user",
      };

      const updatedEntry: PredictionSubmission = {
        userId,
        displayName: profile.displayName,
        matchPredictions: currentPredictions,
        points: existingSubmission?.points || 0,
        groupsComplete: existingSubmission?.groupsComplete || false,
        submittedAt: new Date().toISOString(),
      };

      await upsertSubmission(updatedEntry);

      return NextResponse.json({
        success: true,
        profile,
        predictions: currentPredictions,
        message: "Değiştirme hakkınız kullanılarak maç tahmini başarıyla güncellendi!"
      });
    }

    if (profile.genelTahminHakkiKullanildi) {
      return NextResponse.json({
        error: "Genel tahmin hakkınızı daha önce kullandınız! Tekli maç tahminlerini değiştirmek için MinMat'tan kazandığınız güncelleme haklarını kullanmalısınız."
      }, { status: 400 });
    }

    const matchPredictions: Record<string, MatchPrediction> = {};
    const now = new Date();
    for (const matchId of Object.keys(predictions)) {
      const targetMatch = fixtures.find((m) => m.id === matchId);
      if (targetMatch) {
        const matchDate = new Date(`${targetMatch.date}T${targetMatch.time || "00:00"}:00Z`);
        if (now < matchDate) {
          const score = predictions[matchId];
          if (score && typeof score.home === "number" && typeof score.away === "number") {
            matchPredictions[matchId] = {
              home: score.home,
              away: score.away,
              source: "user",
            };
          }
        }
      }
    }

    profile.genelTahminHakkiKullanildi = true;

    const newEntry: PredictionSubmission = {
      userId,
      displayName: profile.displayName,
      matchPredictions,
      points: existingSubmission?.points || 0,
      groupsComplete: true,
      submittedAt: new Date().toISOString(),
    };

    await upsertSubmission(newEntry);

    return NextResponse.json({
      success: true,
      profile,
      predictions: matchPredictions,
      message: "Genel tahminleriniz başarıyla kaydedildi ve tahmin hakkınız kilitlendi!"
    });

  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
