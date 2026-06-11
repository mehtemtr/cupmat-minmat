import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { Redis } from "@upstash/redis";
import { ensureTimeSpacedBots, STAGE_START_DATES } from "@/lib/fantasy/bot-registration";

const redis = Redis.fromEnv();

import { getGeneralPosition, calculatePlayerPoints, getPlayerEvents } from "@/lib/fantasy/points";

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    
    // Get active stage from Redis or default
    const activeStage = (await redis.get<string>("fantasy_active_stage")) || "matchday_1";
    const stage = searchParams.get("stage") || activeStage;

    // Ensure bots are lazily registered as time progresses
    await ensureTimeSpacedBots(stage, false);

    // 1. Fetch H2H Duel Standings
    const { data: standings, error: standingsError } = await supabaseAdmin
      .from("fantasy_duel_standings")
      .select("*")
      .order("points", { ascending: false })
      .order("total_roster_points", { ascending: false });

    if (standingsError) throw standingsError;

    // Fetch all registered rosters for this stage to display in "Tüm Takımlar" tab
    const { data: allStageRosters } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("team_name, user_id, formation")
      .eq("stage", stage);

    let registeredTeams: Array<{ teamName: string; nickname: string; formation: string }> = [];
    if (allStageRosters && allStageRosters.length > 0) {
      // Find all user IDs to load their nicknames
      const uIds = allStageRosters.map((r) => r.user_id).filter(Boolean);
      let nickMap: Record<string, string> = {};

      if (uIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id, nickname")
          .in("user_id", uIds);

        if (profiles) {
          profiles.forEach((p) => {
            nickMap[p.user_id] = p.nickname || "Katılımcı";
          });
        }
      }

      registeredTeams = allStageRosters.map((r) => ({
        teamName: r.team_name,
        nickname: r.user_id ? nickMap[r.user_id] || "Katılımcı" : "Statmatik Bot",
        formation: r.formation,
        userId: r.user_id,
      }));

      // Sort alphabetically by teamName (case-insensitive, localized to Turkish)
      registeredTeams.sort((a, b) => a.teamName.localeCompare(b.teamName, "tr"));
    }

    // 2. Fetch Fixtures for Current Stage
    const { data: duels, error: duelsError } = await supabaseAdmin
      .from("fantasy_duels")
      .select(`
        id,
        stage,
        roster_id_1,
        roster_id_2,
        user_id_1,
        user_id_2,
        score_1,
        score_2,
        result
      `)
      .eq("stage", stage);

    if (duelsError) throw duelsError;

    // Fetch team names and nicknames for duels
    const rosterIds = duels ? duels.flatMap((d) => [d.roster_id_1, d.roster_id_2].filter(Boolean)) : [];
    let rosterMap: Record<string, any> = {};

    if (rosterIds.length > 0) {
      const { data: rosterDetails } = await supabaseAdmin
        .from("fantasy_rosters")
        .select("id, team_name, user_id")
        .in("id", rosterIds);

      if (rosterDetails) {
        rosterDetails.forEach((r) => {
          rosterMap[r.id] = r;
        });
      }
    }

    const formattedDuels = (duels || []).map((duel) => {
      const roster1 = rosterMap[duel.roster_id_1 || ""];
      const roster2 = rosterMap[duel.roster_id_2 || ""];

      // Match user nicknames
      const user1Standing = standings?.find((s) => s.user_id === duel.user_id_1);
      const user2Standing = standings?.find((s) => s.user_id === duel.user_id_2);

      const name1 = roster1?.team_name || (duel.user_id_1 ? user1Standing?.nickname || "Kullanıcı 1" : "Statmatik Bot");
      const name2 = roster2?.team_name || (duel.user_id_2 ? user2Standing?.nickname || "Kullanıcı 2" : "Statmatik Bot");

      return {
        id: duel.id,
        stage: duel.stage,
        rosterId1: duel.roster_id_1,
        rosterId2: duel.roster_id_2,
        userId1: duel.user_id_1,
        userId2: duel.user_id_2,
        name1,
        name2,
        score1: duel.score_1,
        score2: duel.score_2,
        result: duel.result,
      };
    });

    // 3. Find Logged-In User's Duel and build side-by-side live match details
    const userDuel = formattedDuels.find((d) => d.userId1 === userId || d.userId2 === userId);
    let userDuelDetails: any = null;

    if (userDuel) {
      const rosterId1 = userDuel.rosterId1;
      const rosterId2 = userDuel.rosterId2;

      const fetchRosterPlayers = async (rosterId: string) => {
        if (!rosterId) return [];
        const { data: roster } = await supabaseAdmin
          .from("fantasy_rosters")
          .select("starters, manager_id")
          .eq("id", rosterId)
          .maybeSingle();

        if (!roster || !roster.starters || roster.starters.length === 0) return [];

        const { data: players } = await supabaseAdmin
          .from("team_rosters")
          .select("id, team_id, player_name, player_position, player_number, club")
          .in("id", roster.starters);

        // Fetch stage stats
        const { data: stats } = await supabaseAdmin
          .from("player_stage_stats")
          .select("*")
          .eq("stage", stage)
          .in("player_id", roster.starters);

        const statsMap: Record<string, any> = {};
        if (stats) {
          stats.forEach((s) => {
            statsMap[s.player_id] = s;
          });
        }

        return (players || []).map((p) => {
          const playerStats = statsMap[p.id];
          const pts = calculatePlayerPoints(playerStats, p.player_position);
          return {
            ...p,
            points: pts,
            events: getPlayerEvents(playerStats),
            stats: playerStats || null,
          };
        });
      };

      const startDateStr = STAGE_START_DATES[stage.toLowerCase()];
      const isStageStarted = startDateStr ? (new Date() >= new Date(startDateStr)) : false;

      const starters1 = (isStageStarted || userDuel.userId1 === userId)
        ? await fetchRosterPlayers(rosterId1 || "")
        : [];
      const starters2 = (isStageStarted || userDuel.userId2 === userId)
        ? await fetchRosterPlayers(rosterId2 || "")
        : [];

      // Build live event ticker combined for both teams
      const tickerEvents: Array<{ time: string; player: string; event: string; team: 1 | 2 }> = [];
      starters1.forEach((p) => {
        p.events.forEach((ev: string) => {
          tickerEvents.push({ time: "Canlı", player: p.player_name, event: ev, team: 1 });
        });
      });
      starters2.forEach((p) => {
        p.events.forEach((ev: string) => {
          tickerEvents.push({ time: "Canlı", player: p.player_name, event: ev, team: 2 });
        });
      });

      userDuelDetails = {
        duelId: userDuel.id,
        team1: {
          name: userDuel.name1,
          rosterId: rosterId1,
          score: userDuel.score1,
          starters: starters1,
        },
        team2: {
          name: userDuel.name2,
          rosterId: rosterId2,
          score: userDuel.score2,
          starters: starters2,
        },
        ticker: tickerEvents,
      };
    }

    // 4. Calculate Common Mind XI (Statmatik Bot Team) Showcase
    let commonMindXI: any[] = [];
    const { data: allRosters } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("starters")
      .eq("stage", stage);

    if (allRosters && allRosters.length > 0) {
      const counts: Record<string, number> = {};
      allRosters.forEach((r) => {
        if (Array.isArray(r.starters)) {
          r.starters.forEach((id) => {
            counts[id] = (counts[id] || 0) + 1;
          });
        }
      });

      const playerIds = Object.keys(counts);
      if (playerIds.length > 0) {
        const { data: dbPlayers } = await supabaseAdmin
          .from("team_rosters")
          .select("id, team_id, player_name, player_position, player_number, club")
          .in("id", playerIds);

        if (dbPlayers) {
          const playersWithCounts = dbPlayers.map((p) => ({
            ...p,
            count: counts[p.id] || 0,
            genPos: getGeneralPosition(p.player_position),
          }));

          // Pick 4-4-2: 1 GK, 4 DEF, 4 MID, 2 FWD
          const gks = playersWithCounts.filter((p) => p.genPos === "GK").sort((a, b) => b.count - a.count);
          const defs = playersWithCounts.filter((p) => p.genPos === "DEF").sort((a, b) => b.count - a.count);
          const mids = playersWithCounts.filter((p) => p.genPos === "MID").sort((a, b) => b.count - a.count);
          const fwds = playersWithCounts.filter((p) => p.genPos === "FWD").sort((a, b) => b.count - a.count);

          commonMindXI = [
            ...gks.slice(0, 1),
            ...defs.slice(0, 4),
            ...mids.slice(0, 4),
            ...fwds.slice(0, 2),
          ];
        }
      }
    }

    // Fallback if not enough data to build Common Mind XI
    if (commonMindXI.length === 0) {
      const { data: fallbackPlayers } = await supabaseAdmin
        .from("team_rosters")
        .select("id, team_id, player_name, player_position, player_number, club")
        .limit(20);

      if (fallbackPlayers) {
        const mapped = fallbackPlayers.map((p) => ({
          ...p,
          genPos: getGeneralPosition(p.player_position),
        }));
        commonMindXI = [
          ...mapped.filter((p) => p.genPos === "GK").slice(0, 1),
          ...mapped.filter((p) => p.genPos === "DEF").slice(0, 4),
          ...mapped.filter((p) => p.genPos === "MID").slice(0, 4),
          ...mapped.filter((p) => p.genPos === "FWD").slice(0, 2),
        ];
      }
    }

    return NextResponse.json({
      success: true,
      stage,
      standings: standings || [],
      duels: formattedDuels,
      userDuel: userDuelDetails,
      commonMindXI,
      registeredTeams,
    });
  } catch (error: any) {
    console.error("GET duels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch duels data", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
