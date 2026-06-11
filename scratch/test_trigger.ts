import { ensureTimeSpacedBots } from "../lib/fantasy/bot-registration";
import { supabaseAdmin } from "../lib/supabase";
import { calculatePlayerPoints, getGeneralPosition } from "../lib/fantasy/points";

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

async function run() {
  const stage = "matchday_1";
  console.log("=== Local Trigger Test for Stage:", stage, "===");

  try {
    console.log("Step 1: Time-spaced bots registration...");
    await ensureTimeSpacedBots(stage, true);
    console.log("Step 1 complete!");

    console.log("Step 2: Fetching rosters...");
    const { data: rosters, error: rostersError } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("id, user_id, starters")
      .eq("stage", stage);

    if (rostersError) throw rostersError;
    console.log(`Step 2: Found ${rosters?.length || 0} rosters.`);

    console.log("Step 3: Checking existing duels...");
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
    console.log(`Step 3: Found ${unpairedRosters.length} unpaired rosters.`);

    if (unpairedRosters.length > 0) {
      if (unpairedRosters.length % 2 !== 0) {
        console.log("Odd number of rosters. Generating Statmatik Bot...");
        // Calculate Common Mind XI for this stage
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

        if (botStarters.length < 11) {
          const { data: fallbackPlayers } = await supabaseAdmin
            .from("team_rosters")
            .select("id")
            .limit(11);
          botStarters = (fallbackPlayers || []).map((p) => p.id);
        }

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
        console.log("Statmatik Bot registered!");
      }

      console.log("Pairing unpaired rosters...");
      const shuffled = unpairedRosters.sort(() => Math.random() - 0.5);
      const duelInserts = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        const r1 = shuffled[i];
        const r2 = shuffled[i + 1];

        if (r1 && r2) {
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
        console.log(`Inserting ${duelInserts.length} duels...`);
        const { error: insertDuelErr } = await supabaseAdmin
          .from("fantasy_duels")
          .insert(duelInserts);

        if (insertDuelErr) throw insertDuelErr;
        console.log("Duels inserted successfully!");
      }
    } else {
      console.log("No unpaired rosters. Matchmaking skipped.");
    }

    console.log("Calculating scores...");
    const { data: duels, error: duelsError } = await supabaseAdmin
      .from("fantasy_duels")
      .select("*")
      .eq("stage", stage);

    if (duelsError) throw duelsError;

    // Load roster mappings, positions, stats...
    // Pre-load all rosters for this stage
    const { data: allRosters } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("*")
      .eq("stage", stage);

    const rosterMap = new Map<string, any>();
    const allPlayerIds = new Set<string>();
    const managerIds = new Set<string>();

    (allRosters || []).forEach((r) => {
      rosterMap.set(r.id, r);
      if (Array.isArray(r.starters)) {
        r.starters.forEach((id: string) => allPlayerIds.add(id));
      }
      if (r.manager_id) {
        managerIds.add(r.manager_id);
      }
    });

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

    console.log(`Processing ${duels?.length || 0} duels...`);
    for (const duel of duels || []) {
      const r1 = rosterMap.get(duel.roster_id_1);
      const r2 = rosterMap.get(duel.roster_id_2);

      let score1 = 0;
      let score2 = 0;

      if (r1 && Array.isArray(r1.starters)) {
        r1.starters.forEach((pid: string) => {
          const pos = playerPosMap.get(pid) || "Forvet";
          const stats = playerStatsMap.get(pid);
          score1 += calculatePlayerPoints(stats, pos);
        });

        if (r1.manager_id) {
          const mStats = managerStatsMap.get(r1.manager_id);
          score1 += calculateManagerPoints(mStats);
        }
      }

      if (r2 && Array.isArray(r2.starters)) {
        r2.starters.forEach((pid: string) => {
          const pos = playerPosMap.get(pid) || "Forvet";
          const stats = playerStatsMap.get(pid);
          score2 += calculatePlayerPoints(stats, pos);
        });

        if (r2.manager_id) {
          const mStats = managerStatsMap.get(r2.manager_id);
          score2 += calculateManagerPoints(mStats);
        }
      }

      let result: string | null = "draw";
      if (score1 > score2) result = "win_1";
      else if (score2 > score1) result = "win_2";

      console.log(`Duel ${duel.id}: ${r1?.team_name || 'Bot'} (${score1}) vs ${r2?.team_name || 'Bot'} (${score2}) -> Result: ${result}`);

      await supabaseAdmin
        .from("fantasy_duels")
        .update({
          score_1: score1,
          score_2: score2,
          result,
        })
        .eq("id", duel.id);

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

    console.log("Scores updated! Updating standings...");
    const { data: allDuels, error: allDuelsErr } = await supabaseAdmin
      .from("fantasy_duels")
      .select("*")
      .not("result", "is", null);

    if (allDuelsErr) throw allDuelsErr;

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

      const res = duel.result;
      const score1 = duel.score_1 || 0;
      const score2 = duel.score_2 || 0;

      if (u1) {
        incrementUserStats(u1, res === "win_1", res === "draw", score1);
      }
      if (u2) {
        incrementUserStats(u2, res === "win_2", res === "draw", score2);
      }
    });

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

      console.log(`Upserting standing for ${nick} (${userId}):`, payload);
      const { error: upsertErr } = await supabaseAdmin
        .from("fantasy_duel_standings")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertErr) {
        console.error(`Error upserting standings for user ${userId}:`, upsertErr);
      }
    }

    console.log("=== Local Trigger Test Complete ===");
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

run();
