import { NextResponse } from "next/server";
import { getAiAnalysis } from "@/lib/store/ai-analysis-store";
import type { Locale } from "@/lib/i18n/types";

export async function POST(request: Request) {
  try {
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
      locale === "tr" || locale === "en" || locale === "de" || locale === "fr" || locale === "es"
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
