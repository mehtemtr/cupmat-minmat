import { NextResponse } from "next/server";
import { generateGroupFixtures } from "@/lib/fixtures";

// Cache on Vercel CDN/Edge for 5 minutes (300 seconds)
export const revalidate = 300;

export async function GET() {
  const token = process.env.FOOTBALL_DATA_TOKEN || "";
  const freshFixtures = generateGroupFixtures();
  
  let apiMatches: any[] = [];
  
  if (token) {
    try {
      const url = "https://api.football-data.org/v4/competitions/WC/matches";
      console.log("[Live-Scores-API] Querying Football-Data.org World Cup matches...");
      
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Auth-Token": token,
        },
        next: { revalidate: 300 }, // Enable Next.js caching for 5 minutes
      });

      if (res.ok) {
        const data = await res.json();
        apiMatches = data.matches || [];
      } else {
        console.warn(`Football-Data API returned non-OK status: ${res.status}`);
      }
    } catch (error: any) {
      console.error("[Live-Scores-API] Failed to fetch from Football-Data API:", error);
    }
  } else {
    console.warn("[Live-Scores-API] FOOTBALL_DATA_TOKEN is not defined. Using local overrides only.");
  }

  try {
    const mappedMatches = apiMatches.map((m: any) => {
      const apiHomeTla = (m.homeTeam?.tla || "").toLowerCase().trim();
      const apiAwayTla = (m.awayTeam?.tla || "").toLowerCase().trim();

      // Normalize Football-Data.org API TLA (hai, ury) to local tournament IDs (hti, uru)
      const homeTla = apiHomeTla === "hai" ? "hti" : (apiHomeTla === "ury" ? "uru" : apiHomeTla);
      const awayTla = apiAwayTla === "hai" ? "hti" : (apiAwayTla === "ury" ? "uru" : apiAwayTla);

      // Find local match in fixtures list by matching the home and away team codes
      const localMatch = freshFixtures.find(
        (f) => f.homeTeamId === homeTla && f.awayTeamId === awayTla
      );

      if (!localMatch) return null;

      const status = m.status; // FINISHED, IN_PLAY, PAUSED, TIMED, SCHEDULED
      const played = status === "FINISHED";
      const isLive = ["IN_PLAY", "PAUSED"].includes(status);

      return {
        id: localMatch.id,
        homeScore: (played || isLive) ? m.score.fullTime.home : null,
        awayScore: (played || isLive) ? m.score.fullTime.away : null,
        played,
        isLive,
        status,
      };
    }).filter(Boolean) as any[];

    // Map all raw matches (group and knockout stage) for dynamic mapping on client side
    const rawMatches = apiMatches.map((m: any) => {
      const apiHomeTla = (m.homeTeam?.tla || "").toLowerCase().trim();
      const apiAwayTla = (m.awayTeam?.tla || "").toLowerCase().trim();

      const homeTeamId = apiHomeTla === "hai" ? "hti" : (apiHomeTla === "ury" ? "uru" : apiHomeTla);
      const awayTeamId = apiAwayTla === "hai" ? "hti" : (apiAwayTla === "ury" ? "uru" : apiAwayTla);

      let status = m.status;
      let played = status === "FINISHED";
      let isLive = ["IN_PLAY", "PAUSED"].includes(status);

      let homeScore = (played || isLive) ? m.score.fullTime.home : null;
      let awayScore = (played || isLive) ? m.score.fullTime.away : null;
      let homeET = (played || isLive) ? m.score.extraTime?.home : null;
      let awayET = (played || isLive) ? m.score.extraTime?.away : null;
      let homePen = (played || isLive) ? m.score.penalties?.home : null;
      let awayPen = (played || isLive) ? m.score.penalties?.away : null;

      // Local overrides for specific matches to align with user's tournament calendar/results
      const overrides: Record<string, { homeScore: number; awayScore: number; played: boolean; isLive: boolean; status: string; homeET?: number | null; awayET?: number | null; homePen?: number | null; awayPen?: number | null }> = {
        "por_cro": { homeScore: 2, awayScore: 1, played: true, isLive: false, status: "FINISHED" }, // Group stage override
        "can_mar": { homeScore: 0, awayScore: 3, played: true, isLive: false, status: "FINISHED" },
        "par_fra": { homeScore: 0, awayScore: 1, played: true, isLive: false, status: "FINISHED" },
        "por_esp": { homeScore: 0, awayScore: 1, played: true, isLive: false, status: "FINISHED" },
        "usa_bel": { homeScore: 1, awayScore: 4, played: true, isLive: false, status: "FINISHED" },
        "bra_nor": { homeScore: 1, awayScore: 2, played: true, isLive: false, status: "FINISHED" },
        "mex_eng": { homeScore: 2, awayScore: 3, played: true, isLive: false, status: "FINISHED" },
        "arg_egy": { homeScore: 3, awayScore: 2, played: true, isLive: false, status: "FINISHED" }, // Finished match
        "sui_col": { homeScore: 0, awayScore: 0, homeET: 0, awayET: 0, homePen: 4, awayPen: 3, played: true, isLive: false, status: "FINISHED" },
        "fra_mar": { homeScore: 2, awayScore: 0, played: true, isLive: false, status: "FINISHED" },
        "esp_bel": { homeScore: 2, awayScore: 1, played: true, isLive: false, status: "FINISHED" },
        "nor_eng": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 1, played: true, isLive: false, status: "FINISHED" },
        "sui_arg": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 2, played: true, isLive: false, status: "FINISHED" },
      };

      const key1 = `${homeTeamId}_${awayTeamId}`;
      const key2 = `${awayTeamId}_${homeTeamId}`;
      const matchOverride = overrides[key1] || overrides[key2];

      if (matchOverride) {
        const isSwapped = overrides[key2] !== undefined;
        homeScore = isSwapped ? matchOverride.awayScore : matchOverride.homeScore;
        awayScore = isSwapped ? matchOverride.homeScore : matchOverride.awayScore;
        played = matchOverride.played;
        isLive = matchOverride.isLive;
        status = matchOverride.status;
        homeET = isSwapped ? (matchOverride.awayET ?? null) : (matchOverride.homeET ?? null);
        awayET = isSwapped ? (matchOverride.homeET ?? null) : (matchOverride.awayET ?? null);
        homePen = isSwapped ? (matchOverride.awayPen ?? null) : (matchOverride.homePen ?? null);
        awayPen = isSwapped ? (matchOverride.homePen ?? null) : (matchOverride.awayPen ?? null);
      }

      // If penalties are present and part of the fullTime score, adjust homeScore/awayScore
      if (typeof homePen === "number" && typeof awayPen === "number" && homeScore !== null && awayScore !== null) {
        homeScore = homeScore - homePen;
        awayScore = awayScore - awayPen;
      }

      return {
        homeTeamId,
        awayTeamId,
        homeScore,
        awayScore,
        homeET,
        awayET,
        homePen,
        awayPen,
        played,
        isLive,
        status,
      };
    });

    // Local overrides definition for the fallback insertion
    const overrides: Record<string, { homeScore: number; awayScore: number; played: boolean; isLive: boolean; status: string; homeET?: number | null; awayET?: number | null; homePen?: number | null; awayPen?: number | null }> = {
      "por_cro": { homeScore: 2, awayScore: 1, played: true, isLive: false, status: "FINISHED" },
      "can_mar": { homeScore: 0, awayScore: 3, played: true, isLive: false, status: "FINISHED" },
      "par_fra": { homeScore: 0, awayScore: 1, played: true, isLive: false, status: "FINISHED" },
      "por_esp": { homeScore: 0, awayScore: 1, played: true, isLive: false, status: "FINISHED" },
      "usa_bel": { homeScore: 1, awayScore: 4, played: true, isLive: false, status: "FINISHED" },
      "bra_nor": { homeScore: 1, awayScore: 2, played: true, isLive: false, status: "FINISHED" },
      "mex_eng": { homeScore: 2, awayScore: 3, played: true, isLive: false, status: "FINISHED" },
      "arg_egy": { homeScore: 3, awayScore: 2, played: true, isLive: false, status: "FINISHED" },
      "sui_col": { homeScore: 0, awayScore: 0, homeET: 0, awayET: 0, homePen: 4, awayPen: 3, played: true, isLive: false, status: "FINISHED" },
      "fra_mar": { homeScore: 2, awayScore: 0, played: true, isLive: false, status: "FINISHED" },
      "esp_bel": { homeScore: 2, awayScore: 1, played: true, isLive: false, status: "FINISHED" },
      "nor_eng": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 1, played: true, isLive: false, status: "FINISHED" },
      "sui_arg": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 2, played: true, isLive: false, status: "FINISHED" },
    };

    // Ensure all local overrides are included in rawMatches (even if they are not returned by the API)
    Object.entries(overrides).forEach(([key, override]) => {
      const [t1, t2] = key.split("_");
      if (t1 === "por" && t2 === "cro") return; // Skip group stage override

      const exists = rawMatches.some(
        (rm: any) =>
          (rm.homeTeamId === t1 && rm.awayTeamId === t2) ||
          (rm.homeTeamId === t2 && rm.awayTeamId === t1)
      );

      if (!exists) {
        rawMatches.push({
          homeTeamId: t1,
          awayTeamId: t2,
          homeScore: override.homeScore,
          awayScore: override.awayScore,
          homeET: override.homeET ?? null,
          awayET: override.awayET ?? null,
          homePen: override.homePen ?? null,
          awayPen: override.awayPen ?? null,
          played: override.played,
          isLive: override.isLive,
          status: override.status,
        });
      }
    });

    // Ensure group overrides are also merged into mappedMatches if they exist in freshFixtures
    Object.entries(overrides).forEach(([key, override]) => {
      const [t1, t2] = key.split("_");
      const localMatch = freshFixtures.find(
        (f) => (f.homeTeamId === t1 && f.awayTeamId === t2) || (f.homeTeamId === t2 && f.awayTeamId === t1)
      );
      if (localMatch) {
        const exists = mappedMatches.some((mm: any) => mm.id === localMatch.id);
        if (!exists) {
          const isSwapped = localMatch.homeTeamId === t2;
          mappedMatches.push({
            id: localMatch.id,
            homeScore: isSwapped ? override.awayScore : override.homeScore,
            awayScore: isSwapped ? override.homeScore : override.awayScore,
            played: override.played,
            isLive: override.isLive,
            status: override.status,
          });
        }
      }
    });

    console.log(`[Live-Scores-API] Successfully mapped ${mappedMatches.length} group matches and ${rawMatches.length} raw matches (including overrides).`);

    return NextResponse.json({
      success: true,
      matches: mappedMatches,
      rawMatches: rawMatches,
    });
  } catch (error: any) {
    console.error("[Live-Scores-API] Failed to process live scores:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process scores", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
