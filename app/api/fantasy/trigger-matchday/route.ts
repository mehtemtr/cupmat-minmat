import { NextResponse } from "next/server";
import { verifyAdminSecret } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { calculatePlayerPoints, getGeneralPosition } from "@/lib/fantasy/points";
import { ensureTimeSpacedBots } from "@/lib/fantasy/bot-registration";

// Function to calculate manager points
function calculateManagerPoints(stats: any): number {
  if (!stats) return 0;
  let pts = 0;
  if (stats.result === "win") {
    pts += 5;
    if ((stats.goal_difference || 0) >= 3) {
      pts += 2;
    }
  } else if (stats.result === "draw") {
    pts += 2;
  } else if (stats.result === "loss") {
    pts -= 2;
    if ((stats.goal_difference || 0) <= -3) {
      pts -= 2;
    }
  }
  return pts;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!verifyAdminSecret(request, body)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stage = "matchday_1", action = "all" } = body;

    const reports: string[] = [];

    // ==========================================
    // ACTION 1: PAIRING / MATCHMAKING
    // ==========================================
    if (action === "pair" || action === "all") {
      reports.push("Starting H2H matchmaking...");

      // Force register all needed bots to ensure league is complete
      await ensureTimeSpacedBots(stage, true);

      // Fetch all rosters for this stage
      const { data: rosters, error: rostersError } = await supabaseAdmin
        .from("fantasy_rosters")
        .select("id, user_id, starters")
        .eq("stage", stage);

      if (rostersError) throw rostersError;

      // Filter out rosters that already have a duel in this stage
      const { data: existingDuels } = await supabaseAdmin
        .from("fantasy_duels")
        .select("roster_id_1, roster_id_2")
        .eq("stage", stage);

      const pairedRosterIds = new Set<string>();
      if (existingDuels) {
        existingDuels.forEach((d) => {
          if (d.roster_id_1) pairedRosterIds.add(d.roster_id_1);
          if (d.roster_id_2) pairedRosterIds.add(d.roster_id_2);
        });
      }

      const unpairedRosters = (rosters || []).filter((r) => !pairedRosterIds.has(r.id));
      reports.push(`Found ${unpairedRosters.length} unpaired rosters out of ${rosters?.length || 0} total rosters.`);

      if (unpairedRosters.length > 0) {
        // If odd count, inject Statmatik Bot roster
        if (unpairedRosters.length % 2 !== 0) {
          reports.push("Odd number of rosters detected. Generating Statmatik Bot roster...");

          // Calculate Common Mind XI for this stage (to form the bot roster starters)
          const counts: Record<string, number> = {};
          (rosters || []).forEach((r) => {
            if (Array.isArray(r.starters)) {
              r.starters.forEach((id) => {
                counts[id] = (counts[id] || 0) + 1;
              });
            }
          });

          let botStarters: string[] = [];
          const playerIds = Object.keys(counts);

          if (playerIds.length > 0) {
            const { data: dbPlayers } = await supabaseAdmin
              .from("team_rosters")
              .select("id, player_position")
              .in("id", playerIds);

            if (dbPlayers) {
              const playersWithCounts = dbPlayers.map((p) => ({
                ...p,
                count: counts[p.id] || 0,
                genPos: getGeneralPosition(p.player_position),
              }));

              const gks = playersWithCounts.filter((p) => p.genPos === "GK").sort((a, b) => b.count - a.count);
              const defs = playersWithCounts.filter((p) => p.genPos === "DEF").sort((a, b) => b.count - a.count);
              const mids = playersWithCounts.filter((p) => p.genPos === "MID").sort((a, b) => b.count - a.count);
              const fwds = playersWithCounts.filter((p) => p.genPos === "FWD").sort((a, b) => b.count - a.count);

              botStarters = [
                ...gks.slice(0, 1).map((p) => p.id),
                ...defs.slice(0, 4).map((p) => p.id),
                ...mids.slice(0, 4).map((p) => p.id),
                ...fwds.slice(0, 2).map((p) => p.id),
              ];
            }
          }

          // Fallback if we don't have enough players
          if (botStarters.length < 11) {
            const { data: fallbackPlayers } = await supabaseAdmin
              .from("team_rosters")
              .select("id")
              .limit(11);
            botStarters = (fallbackPlayers || []).map((p) => p.id);
          }

          // Create bot roster record or retrieve if it exists
          const botUserId = "statmatik_bot";
          const { data: existingBotRoster } = await supabaseAdmin
            .from("fantasy_rosters")
            .select("id")
            .eq("user_id", botUserId)
            .eq("stage", stage)
            .maybeSingle();

          let botRosterId: string;

          if (existingBotRoster) {
            botRosterId = existingBotRoster.id;
            await supabaseAdmin
              .from("fantasy_rosters")
              .update({ starters: botStarters })
              .eq("id", botRosterId);
          } else {
            const { data: newBotRoster, error: botInsertErr } = await supabaseAdmin
              .from("fantasy_rosters")
              .insert({
                user_id: botUserId,
                team_name: "Statmatik Bot",
                stage,
                formation: "4-4-2",
                starters: botStarters,
                bench: [],
                manager_id: null,
                points: 0,
                team_index: 1,
              })
              .select("id")
              .single();

            if (botInsertErr) throw botInsertErr;
            botRosterId = newBotRoster.id;
          }

          unpairedRosters.push({
            id: botRosterId,
            user_id: botUserId,
            starters: botStarters,
          });
        }

        // Shuffle unpaired rosters
        const shuffled = unpairedRosters.sort(() => Math.random() - 0.5);

        // Pair them and insert into fantasy_duels
        const duelInserts = [];
        for (let i = 0; i < shuffled.length; i += 2) {
          const r1 = shuffled[i];
          const r2 = shuffled[i + 1];

          if (r1 && r2) {
            // Treat bot users normally so they show up in H2H standings
            duelInserts.push({
              stage,
              roster_id_1: r1.id,
              roster_id_2: r2.id,
              user_id_1: r1.user_id,
              user_id_2: r2.user_id,
              score_1: 0,
              score_2: 0,
              result: null,
            });
          }
        }

        if (duelInserts.length > 0) {
          const { error: insertDuelErr } = await supabaseAdmin
            .from("fantasy_duels")
            .insert(duelInserts);

          if (insertDuelErr) throw insertDuelErr;
          reports.push(`Created ${duelInserts.length} new H2H duel matches.`);
        }
      } else {
        reports.push("No unpaired rosters. Skipping matchmaking.");
      }
    }

    // ==========================================
    // ACTION 2: SCORE CALCULATION
    // ==========================================
    if (action === "calculate" || action === "all") {
      reports.push("Calculating stage points...");

      // Fetch all duels for this stage
      const { data: duels, error: duelsError } = await supabaseAdmin
        .from("fantasy_duels")
        .select("*")
        .eq("stage", stage);

      if (duelsError) throw duelsError;

      // Pre-load all rosters for this stage
      const { data: rosters, error: rostersError } = await supabaseAdmin
        .from("fantasy_rosters")
        .select("*")
        .eq("stage", stage);

      if (rostersError) throw rostersError;

      const rosterMap = new Map<string, any>();
      const allPlayerIds = new Set<string>();
      const managerIds = new Set<string>();

      rosters.forEach((r) => {
        rosterMap.set(r.id, r);
        if (Array.isArray(r.starters)) {
          r.starters.forEach((id: string) => allPlayerIds.add(id));
        }
        if (r.manager_id) {
          managerIds.add(r.manager_id);
        }
      });

      // Load all player positions
      const playerPosMap = new Map<string, string>();
      if (allPlayerIds.size > 0) {
        const { data: players } = await supabaseAdmin
          .from("team_rosters")
          .select("id, player_position")
          .in("id", Array.from(allPlayerIds));

        if (players) {
          players.forEach((p) => playerPosMap.set(p.id, p.player_position));
        }
      }

      // Load all player stats for this stage
      const playerStatsMap = new Map<string, any>();
      if (allPlayerIds.size > 0) {
        const { data: stats } = await supabaseAdmin
          .from("player_stage_stats")
          .select("*")
          .eq("stage", stage)
          .in("player_id", Array.from(allPlayerIds));

        if (stats) {
          stats.forEach((s) => playerStatsMap.set(s.player_id, s));
        }
      }

      // Load all manager stats for this stage
      const managerStatsMap = new Map<string, any>();
      if (managerIds.size > 0) {
        const { data: mStats } = await supabaseAdmin
          .from("manager_stage_stats")
          .select("*")
          .eq("stage", stage)
          .in("manager_id", Array.from(managerIds));

        if (mStats) {
          mStats.forEach((s) => managerStatsMap.set(s.manager_id, s));
        }
      }

      // Process each duel
      for (const duel of duels || []) {
        const r1 = rosterMap.get(duel.roster_id_1);
        const r2 = rosterMap.get(duel.roster_id_2);

        let score1 = 0;
        let score2 = 0;

        // Calculate Roster 1 starters points
        if (r1 && Array.isArray(r1.starters)) {
          r1.starters.forEach((pid: string) => {
            const pos = playerPosMap.get(pid) || "Forvet";
            const stats = playerStatsMap.get(pid);
            score1 += calculatePlayerPoints(stats, pos);
          });

          // Add Roster 1 manager points
          if (r1.manager_id) {
            const mStats = managerStatsMap.get(r1.manager_id);
            score1 += calculateManagerPoints(mStats);
          }
        }

        // Calculate Roster 2 starters points
        if (r2 && Array.isArray(r2.starters)) {
          r2.starters.forEach((pid: string) => {
            const pos = playerPosMap.get(pid) || "Forvet";
            const stats = playerStatsMap.get(pid);
            score2 += calculatePlayerPoints(stats, pos);
          });

          // Add Roster 2 manager points
          if (r2.manager_id) {
            const mStats = managerStatsMap.get(r2.manager_id);
            score2 += calculateManagerPoints(mStats);
          }
        }

        // Determine result
        let result: string | null = "draw";
        if (score1 > score2) result = "win_1";
        else if (score2 > score1) result = "win_2";

        // Update duel record
        await supabaseAdmin
          .from("fantasy_duels")
          .update({
            score_1: score1,
            score_2: score2,
            result,
          })
          .eq("id", duel.id);

        // Update rosters points
        if (r1) {
          await supabaseAdmin
            .from("fantasy_rosters")
            .update({ points: score1 })
            .eq("id", r1.id);
        }
        if (r2) {
          await supabaseAdmin
            .from("fantasy_rosters")
            .update({ points: score2 })
            .eq("id", r2.id);
        }
      }

      reports.push(`Recalculated scores and updated ${duels?.length || 0} duels.`);
    }

    // ==========================================
    // ACTION 3: STANDINGS RECALCULATION (SELF-HEALING)
    // ==========================================
    if (action === "standings" || action === "all") {
      reports.push("Rebuilding H2H Standings from all completed duels...");

      // Fetch all duels where result is computed
      const { data: allDuels, error: duelsErr } = await supabaseAdmin
        .from("fantasy_duels")
        .select("*")
        .not("result", "is", null);

      if (duelsErr) throw duelsErr;

      // Group standings stats by user
      const statsByUser: Record<
        string,
        { won: number; drawn: number; lost: number; points: number; totalRosterPoints: number }
      > = {};

      const incrementUserStats = (userId: string, isWin: boolean, isDraw: boolean, rosterPoints: number) => {
        if (!statsByUser[userId]) {
          statsByUser[userId] = { won: 0, drawn: 0, lost: 0, points: 0, totalRosterPoints: 0 };
        }
        const s = statsByUser[userId];
        s.totalRosterPoints += rosterPoints;
        if (isWin) {
          s.won += 1;
          s.points += 3;
        } else if (isDraw) {
          s.drawn += 1;
          s.points += 1;
        } else {
          s.lost += 1;
        }
      };

      allDuels.forEach((duel) => {
        const u1 = duel.user_id_1;
        const u2 = duel.user_id_2;

        const res = duel.result; // 'win_1', 'win_2', 'draw'
        const score1 = duel.score_1 || 0;
        const score2 = duel.score_2 || 0;

        if (u1) {
          incrementUserStats(u1, res === "win_1", res === "draw", score1);
        }
        if (u2) {
          incrementUserStats(u2, res === "win_2", res === "draw", score2);
        }
      });

      // Get user nicknames from profiles
      const userIds = Object.keys(statsByUser);
      let nicknameMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from("profiles")
          .select("user_id, nickname")
          .in("user_id", userIds);

        if (profiles) {
          profiles.forEach((p) => {
            nicknameMap[p.user_id] = p.nickname;
          });
        }
      }

      // Upsert into standings
      for (const [userId, stats] of Object.entries(statsByUser)) {
        const nick = nicknameMap[userId] || "Katılımcı";
        const played = stats.won + stats.drawn + stats.lost;

        const payload = {
          user_id: userId,
          nickname: nick,
          played,
          won: stats.won,
          drawn: stats.drawn,
          lost: stats.lost,
          points: stats.points,
          total_roster_points: stats.totalRosterPoints,
          updated_at: new Date().toISOString(),
        };

        const { error: upsertErr } = await supabaseAdmin
          .from("fantasy_duel_standings")
          .upsert(payload, { onConflict: "user_id" });

        if (upsertErr) {
          console.error(`Error upserting standings for user ${userId}:`, upsertErr);
        }
      }

      reports.push(`Updated ${Object.keys(statsByUser).length} user duel standings.`);
    }

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("Matchday trigger error:", error);
    return NextResponse.json(
      { error: "Matchday trigger failed", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
