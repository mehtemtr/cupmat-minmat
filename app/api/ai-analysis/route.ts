import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { getOrCreateProfile } from "@/lib/store/gamification-store";
import { getAiAnalysis } from "@/lib/store/ai-analysis-store";
import type { Locale } from "@/lib/i18n/types";

const MIN_MINMAT_GAMES_TODAY = 5;

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const profile = await getOrCreateProfile(
      authResult.userId,
      authResult.displayName,
    );

    if ((profile.minmatOyunSayisiBugun || 0) < MIN_MINMAT_GAMES_TODAY) {
      return NextResponse.json(
        {
          error:
            "Bu analizi görmek için bugün MinMat'ta en az 5 oyun tamamlamalısınız.",
          requiredGames: MIN_MINMAT_GAMES_TODAY,
          playedToday: profile.minmatOyunSayisiBugun || 0,
        },
        { status: 403 },
      );
    }

    const { matchId, homeTeamId, awayTeamId, locale } = (await request.json()) as {
      matchId?: string;
      homeTeamId?: string;
      awayTeamId?: string;
      locale?: Locale;
    };

    if (!matchId || !homeTeamId || !awayTeamId) {
      return NextResponse.json({ error: "Missing match parameters" }, { status: 400 });
    }

    const validLocale: Locale =
      locale && ["tr", "en", "de", "fr", "es", "pt", "ar", "ko", "it"].includes(locale)
        ? locale
        : "tr";

    const result = getAiAnalysis(matchId, homeTeamId, awayTeamId, validLocale);

    return NextResponse.json({
      success: true,
      analysis: result,
    });
  } catch (error) {
    console.error("AI Analysis API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
