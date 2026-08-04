import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { getOrCreateProfile } from "@/lib/store/gamification-store";
import { getAiAnalysis } from "@/lib/store/ai-analysis-store";
import { supabaseAdmin } from "@/lib/supabase";
import { generateGroupFixtures } from "@/lib/fixtures";
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

    // 1. Try querying the database match_analyses table first
    let dbRecord = null;
    try {
      const { data: byId } = await supabaseAdmin
        .from("match_analyses")
        .select("*")
        .eq("match_id", matchId)
        .maybeSingle();

      if (byId) {
        dbRecord = byId;
      } else {
        const { data: byTeams } = await supabaseAdmin
          .from("match_analyses")
          .select("*")
          .or(`and(home_team_id.eq.${homeTeamId},away_team_id.eq.${awayTeamId}),and(home_team_id.eq.${awayTeamId},away_team_id.eq.${homeTeamId})`)
          .maybeSingle();
        if (byTeams) {
          dbRecord = byTeams;
        }
      }
    } catch (dbErr) {
      console.error("Database query failed, falling back to static predictions:", dbErr);
    }

    if (dbRecord) {
      const allFixtures = generateGroupFixtures();
      const matchFixture = allFixtures.find((m) => m.id === matchId);
      const isPastMatch = matchFixture 
        ? (matchFixture.played || matchFixture.homeScore !== null || matchFixture.awayScore !== null) 
        : false;

      const localeColMap: Record<string, string> = {
        tr: "ai_commentary_tr",
        en: "ai_commentary_en",
        es: "ai_commentary_es",
        fr: "ai_commentary_fr",
        de: "ai_commentary_de",
      };
      
      const colName = localeColMap[validLocale] || "ai_commentary_tr";
      const commentVal = isPastMatch ? null : (dbRecord[colName] || dbRecord["ai_commentary_tr"]);

      return NextResponse.json({
        success: true,
        analysis: {
          matchId: dbRecord.match_id,
          date: dbRecord.last_updated,
          skor: dbRecord.predicted_scoreline || "1-1",
          analiz: commentVal || "",
          comment: commentVal || null,
          dirty: false,
        },
      });
    }

    // 2. Fallback to in-memory/static store if database record doesn't exist
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
