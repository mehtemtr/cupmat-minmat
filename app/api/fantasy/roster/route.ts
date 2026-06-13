import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getOrCreateProfile, getGamificationLeaderboard, getStore } from "@/lib/store/gamification-store";
import { OFFICIAL_GROUP_DRAW } from "@/data/official-groups";
import { Redis } from "@upstash/redis";
import { ensureTimeSpacedBots, STAGE_START_DATES } from "@/lib/fantasy/bot-registration";
import { getAdjustedDate } from "@/lib/tournament/time-helper";
import { getGeneralPosition, getPlayerMapping, translateToUuid, translateToStatic, getLockedTeamsForStage } from "@/lib/fantasy/points";

const redis = Redis.fromEnv();

// Map country codes to World Cup Groups (A-L)
const teamToGroup: Record<string, string> = {};
for (const [group, teams] of Object.entries(OFFICIAL_GROUP_DRAW)) {
  for (const team of teams) {
    teamToGroup[team.toLowerCase()] = group;
  }
}

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const { searchParams } = new URL(request.url);
    const activeStage = (await redis.get<string>("fantasy_active_stage")) || "matchday_1";
    const stage = searchParams.get("stage") || activeStage;

    // Ensure bots are registered lazily as time progresses
    await ensureTimeSpacedBots(stage, false);

    const { data: rosters, error } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("*")
      .eq("user_id", userId)
      .eq("stage", stage)
      .order("team_index", { ascending: true });

    if (error) {
      throw error;
    }

    const mapping = await getPlayerMapping();

    // Join player details for each roster
    const rostersWithDetails = await Promise.all(
      (rosters || []).map(async (roster) => {
        const playerIds = [...(roster.starters || []), ...(roster.bench || [])];
        let playersMap: Record<string, any> = {};

        if (playerIds.length > 0) {
          const { data: playersData, error: playersError } = await supabaseAdmin
            .from("team_rosters")
            .select("id, team_id, player_name, player_position, player_number, club")
            .in("id", playerIds);

          if (!playersError && playersData) {
            playersData.forEach((p) => {
              playersMap[p.id] = {
                ...p,
                generalPosition: getGeneralPosition(p.player_position),
              };
            });
          }
        }

        const startersWithDetails = (roster.starters || []).map((id: string) => {
          const dbPlayer = playersMap[id];
          const staticId = translateToStatic(id, mapping);
          if (dbPlayer && staticId) {
            return {
              ...dbPlayer,
              id: staticId,
              generalPosition: getGeneralPosition(dbPlayer.player_position)
            };
          }
          return { id: staticId || id };
        });

        const benchWithDetails = (roster.bench || []).map((id: string) => {
          const dbPlayer = playersMap[id];
          const staticId = translateToStatic(id, mapping);
          if (dbPlayer && staticId) {
            return {
              ...dbPlayer,
              id: staticId,
              generalPosition: getGeneralPosition(dbPlayer.player_position)
            };
          }
          return { id: staticId || id };
        });

        return {
          ...roster,
          starters: startersWithDetails,
          bench: benchWithDetails,
        };
      })
    );

    const now = getAdjustedDate();
    const lockedTeams = getLockedTeamsForStage(stage, now);

    const stages = ["matchday_1", "matchday_2", "matchday_3", "round_of_32", "round_of_16", "quarter_finals", "semi_finals", "finals"];
    const currentIdx = stages.indexOf(stage.toLowerCase());
    let isLocked = false;
    
    if (currentIdx !== -1) {
      const nextStage = stages[currentIdx + 1];
      if (nextStage) {
        const nextStageStartStr = STAGE_START_DATES[nextStage];
        if (nextStageStartStr) {
          isLocked = getAdjustedDate() >= new Date(nextStageStartStr);
        }
      } else {
        // Finals
        const finalsStartStr = STAGE_START_DATES["finals"];
        if (finalsStartStr) {
          const finalsStart = new Date(finalsStartStr);
          isLocked = getAdjustedDate().getTime() >= (finalsStart.getTime() + 3 * 24 * 60 * 60 * 1000);
        }
      }
    }

    return NextResponse.json({ success: true, rosters: rostersWithDetails, isLocked, stage, lockedTeams });
  } catch (error: any) {
    console.error("GET rosters error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rosters", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const userEmail = authResult.email;
    const displayName = authResult.displayName;

    const body = await request.json();
    const {
      teamName,
      stage = "matchday_1",
      formation = "4-4-2",
      starters: clientStarters = [],
      bench: clientBench = [],
      managerId,
      teamIndex = 1,
    } = body;

    // Global kickoff lock is bypassed in favor of per-team kickoff locks below

    const mapping = await getPlayerMapping();
    const starters = clientStarters.map((id: string) => translateToUuid(id, mapping)).filter(Boolean);
    const bench = clientBench.map((id: string) => translateToUuid(id, mapping)).filter(Boolean);

    // 1. Validate basic inputs
    if (!teamName || starters.length !== 11) {
      return NextResponse.json(
        { error: "Takım adı ve 11 ilk 11 oyuncusu seçilmelidir." },
        { status: 400 }
      );
    }

    // Fetch previous roster if exists
    const { data: prevRoster } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("*")
      .eq("user_id", userId)
      .eq("stage", stage)
      .eq("team_index", teamIndex)
      .maybeSingle();

    // Player-level kickoff lock validation
    const now = getAdjustedDate();
    const lockedTeams = getLockedTeamsForStage(stage, now);

    const allPlayerIdsForLockCheck = Array.from(new Set([
      ...(prevRoster?.starters || []),
      ...(prevRoster?.bench || []),
      ...starters,
      ...bench
    ]));

    const playerTeamMap = new Map<string, string>();
    if (allPlayerIdsForLockCheck.length > 0) {
      const { data: dbPlayers } = await supabaseAdmin
        .from("team_rosters")
        .select("id, team_id")
        .in("id", allPlayerIdsForLockCheck);
      
      if (dbPlayers) {
        dbPlayers.forEach(p => playerTeamMap.set(p.id, p.team_id.toLowerCase()));
      }
    }

    if (!prevRoster) {
      // First-time roster creation
      for (const pid of [...starters, ...bench]) {
        const teamId = playerTeamMap.get(pid);
        if (teamId && lockedTeams.includes(teamId)) {
          return NextResponse.json(
            { error: `Maçı başlamış olan takımların oyuncuları kadroya eklenemez (${teamId.toUpperCase()}).` },
            { status: 403 }
          );
        }
      }
      if (managerId && lockedTeams.includes(managerId.toLowerCase())) {
        return NextResponse.json(
          { error: `Maçı başlamış olan takımların menajerleri kadroya eklenemez (${managerId.toUpperCase()}).` },
          { status: 403 }
        );
      }
    } else {
      // Roster update validation
      const oldPlayers = new Set([...(prevRoster.starters || []), ...(prevRoster.bench || [])]);
      const newPlayers = new Set([...starters, ...bench]);

      // Check 1: No locked player can be removed
      for (const pid of oldPlayers) {
        const teamId = playerTeamMap.get(pid);
        if (teamId && lockedTeams.includes(teamId)) {
          if (!newPlayers.has(pid)) {
            return NextResponse.json(
              { error: "Maçı başlamış veya bitmiş oyuncular kadrodan çıkarılamaz." },
              { status: 403 }
            );
          }
        }
      }

      // Check 2: No locked player can be added
      for (const pid of newPlayers) {
        const teamId = playerTeamMap.get(pid);
        if (teamId && lockedTeams.includes(teamId)) {
          if (!oldPlayers.has(pid)) {
            return NextResponse.json(
              { error: "Maçı başlamış veya bitmiş olan takımların oyuncuları kadroya sonradan eklenemez." },
              { status: 403 }
            );
          }
        }
      }

      // Check 3: No locked player can be moved between starters and bench
      const oldStartersSet = new Set(prevRoster.starters || []);
      const oldBenchSet = new Set(prevRoster.bench || []);
      for (const pid of newPlayers) {
        const teamId = playerTeamMap.get(pid);
        if (teamId && lockedTeams.includes(teamId)) {
          if (oldStartersSet.has(pid) && !starters.includes(pid)) {
            return NextResponse.json(
              { error: "Maçı başlamış oyuncular ilk 11 ile yedekler arasında taşınamaz." },
              { status: 403 }
            );
          }
          if (oldBenchSet.has(pid) && !bench.includes(pid)) {
            return NextResponse.json(
              { error: "Maçı başlamış oyuncular yedekler ile ilk 11 arasında taşınamaz." },
              { status: 403 }
            );
          }
        }
      }

      // Check 4: Manager change
      if (prevRoster.manager_id !== managerId) {
        const oldManagerTeam = prevRoster.manager_id?.toLowerCase();
        const newManagerTeam = managerId?.toLowerCase();
        if (oldManagerTeam && lockedTeams.includes(oldManagerTeam)) {
          return NextResponse.json(
            { error: "Maçı başlamış olan menajer değiştirilemez." },
            { status: 403 }
          );
        }
        if (newManagerTeam && lockedTeams.includes(newManagerTeam)) {
          return NextResponse.json(
            { error: "Maçı başlamış olan bir menajer kadroya eklenemez." },
            { status: 403 }
          );
        }
      }
    }

    // Check if stage is active
    const activeStage = (await redis.get<string>("fantasy_active_stage")) || "matchday_1";
    const isStageActive = stage.toLowerCase() === activeStage.toLowerCase();

    // 2. Validate user unlock eligibility and limits
    const profile = await getOrCreateProfile(userId);
    const categories = ["add", "sub", "mul", "div", "mix"] as const;
    const maxLevels = profile.minmatMaxLevels || { add: 1, sub: 1, mul: 1, div: 1, mix: 1 };
    const gamesCount = profile.minmatGamesPlayedCount || { add: 0, sub: 0, mul: 0, div: 0, mix: 0 };

    if (!prevRoster) {
      // First-time roster creation
      if (isStageActive) {
        // Latecomer mode: Level >= 7 in any category
        const hasLevel7 = categories.some((cat) => (maxLevels[cat] || 1) >= 7);
        if (!hasLevel7) {
          const currentMaxLevel = Math.max(...categories.map((cat) => maxLevels[cat] || 1));
          return NextResponse.json(
            { error: `Kadro kurabilmek için herhangi bir MinMat kategorisinde en az Seviye 7'ye ulaşmış olmalısınız. Mevcut en yüksek seviyeniz: Seviye ${currentMaxLevel}.` },
            { status: 403 }
          );
        }
      } else {
        // Normal mode (pre-kickoff): Level >= 3 and Games >= 5 in all categories
        const isBaseUnlocked = categories.every(
          (cat) => (maxLevels[cat] || 1) >= 3 && (gamesCount[cat] || 0) >= 5
        );
        if (!isBaseUnlocked) {
          return NextResponse.json(
            { error: "Kadro kurabilmek için tüm MinMat kategorilerinde en az Seviye 3'e ulaşıp 5'er oyun oynamış olmalısınız." },
            { status: 403 }
          );
        }
      }
    }

    // Calculate max rosters allowed
    const totalGamesPlayed = Object.values(gamesCount).reduce((sum, count) => sum + count, 0);
    let isInTop10 = false;
    try {
      const leaderboard = await getGamificationLeaderboard();
      const userIndex = leaderboard.findIndex((u) => u.userId === userId);
      if (userIndex >= 0 && userIndex < 10) {
        isInTop10 = true;
      }
    } catch (e) {}

    let maxTeams = 1;
    if (isInTop10) maxTeams = 4;
    else if (totalGamesPlayed >= 30) maxTeams = 3;
    else if (totalGamesPlayed >= 15) maxTeams = 2;

    if (teamIndex < 1 || teamIndex > maxTeams) {
      return NextResponse.json(
        { error: `Seçilen takım indeksi geçersiz. Maksimum ${maxTeams} takım kurabilirsiniz.` },
        { status: 400 }
      );
    }

    // Calculate bench slots allowed
    let allowedBenchSlots = 0;
    const countLevel10 = categories.filter((cat) => (maxLevels[cat] || 1) >= 10).length;
    const countLevel7 = categories.filter((cat) => (maxLevels[cat] || 1) >= 7).length;
    const countLevel5 = categories.filter((cat) => (maxLevels[cat] || 1) >= 5).length;

    if (countLevel10 >= 3) allowedBenchSlots = 3;
    else if (countLevel7 >= 3) allowedBenchSlots = 2;
    else if (countLevel5 >= 3) allowedBenchSlots = 1;

    if (bench.length > allowedBenchSlots) {
      return NextResponse.json(
        { error: `Yedek oyuncu sayısı limiti aşıldı. Maksimum yedek sayısı: ${allowedBenchSlots}` },
        { status: 400 }
      );
    }

    // 3. Fetch player details to perform formation and limit validations
    const allPlayerIds = [...starters, ...bench];
    const { data: dbPlayers, error: dbPlayersError } = await supabaseAdmin
      .from("team_rosters")
      .select("id, team_id, player_name, player_position")
      .in("id", allPlayerIds);

    if (dbPlayersError || !dbPlayers || dbPlayers.length !== allPlayerIds.length) {
      return NextResponse.json(
        { error: "Seçilen futbolculardan bazıları veritabanında bulunamadı." },
        { status: 400 }
      );
    }

    const playerMap: Record<string, typeof dbPlayers[0]> = {};
    dbPlayers.forEach((p) => {
      playerMap[p.id] = p;
    });

    // Validate Bench Positions
    if (bench.length > 0) {
      const benchGks = bench.map((id: string) => playerMap[id]).filter((p: any) => p && getGeneralPosition(p.player_position) === "GK").length;
      const benchDefs = bench.map((id: string) => playerMap[id]).filter((p: any) => p && getGeneralPosition(p.player_position) === "DEF").length;
      const benchMids = bench.map((id: string) => playerMap[id]).filter((p: any) => p && getGeneralPosition(p.player_position) === "MID").length;
      const benchFwds = bench.map((id: string) => playerMap[id]).filter((p: any) => p && getGeneralPosition(p.player_position) === "FWD").length;

      if (allowedBenchSlots === 1) {
        if (benchGks > 0 || benchDefs > 0 || benchMids > 1 || benchFwds > 0) {
          return NextResponse.json({ error: "Yedek kadronuzda sadece 1 Orta Saha oyuncusu bulunabilir." }, { status: 400 });
        }
      } else if (allowedBenchSlots === 2) {
        if (benchGks > 0 || benchDefs > 1 || benchMids > 1 || benchFwds > 0) {
          return NextResponse.json({ error: "Yedek kadronuzda sadece 1 Defans ve 1 Orta Saha oyuncusu bulunabilir." }, { status: 400 });
        }
      } else if (allowedBenchSlots === 3) {
        if (benchGks > 1 || benchDefs > 1 || benchMids > 1 || benchFwds > 0) {
          return NextResponse.json({ error: "Yedek kadronuzda sadece 1 Kaleci, 1 Defans ve 1 Orta Saha oyuncusu bulunabilir." }, { status: 400 });
        }
      } else if (allowedBenchSlots >= 4) {
        if (benchGks > 1 || benchDefs > 1 || benchMids > 1 || benchFwds > 1) {
          return NextResponse.json({ error: "Yedek kadronuzda her mevkiden en fazla 1'er oyuncu bulunabilir." }, { status: 400 });
        }
      }
    }

    // 4. Validate Formation Slots
    const formationParts = formation.split("-").map(Number);
    if (formationParts.length !== 3 || formationParts.reduce((a: number, b: number) => a + b, 0) !== 10) {
      return NextResponse.json({ error: "Geçersiz diziliş formatı." }, { status: 400 });
    }

    const reqDEF = formationParts[0];
    const reqMID = formationParts[1];
    const reqFWD = formationParts[2];

    let gkCount = 0;
    let defCount = 0;
    let midCount = 0;
    let fwdCount = 0;

    starters.forEach((id: string) => {
      const p = playerMap[id];
      const genPos = getGeneralPosition(p.player_position);
      if (genPos === "GK") gkCount++;
      else if (genPos === "DEF") defCount++;
      else if (genPos === "MID") midCount++;
      else if (genPos === "FWD") fwdCount++;
    });

    if (gkCount !== 1 || defCount !== reqDEF || midCount !== reqMID || fwdCount !== reqFWD) {
      return NextResponse.json(
        {
          error: `Diziliş hatası! Seçilen diziliş (${formation}) için 1 Kaleci, ${reqDEF} Defans, ${reqMID} Orta Saha ve ${reqFWD} Forvet gereklidir. Kadronuzdaki dağılım: GK: ${gkCount}, DEF: ${defCount}, MID: ${midCount}, FWD: ${fwdCount}`,
        },
        { status: 400 }
      );
    }

    // 5. Validate Country Limits
    // Max 3 players from same country in group stage, 4 in Ro32/Ro16, 5 in QF, 7 in SF/F
    let countryLimit = 3;
    const stg = stage.toLowerCase();
    if (stg.includes("quarter")) {
      countryLimit = 5;
    } else if (stg.includes("semi") || stg.includes("final")) {
      countryLimit = 7;
    } else if (stg.includes("round")) {
      countryLimit = 4;
    }

    const countryCounts: Record<string, number> = {};
    for (const id of allPlayerIds) {
      const country = playerMap[id].team_id.toLowerCase();
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (countryCounts[country] > countryLimit) {
        return NextResponse.json(
          { error: `Ülke limiti aşıldı! Bir ülkeden en fazla ${countryLimit} oyuncu seçebilirsiniz. (${playerMap[id].team_id.toUpperCase()} aşılıyor)` },
          { status: 400 }
        );
      }
    }

    // 6. Validate Group Limits (Max 5 players from same group)
    const groupCounts: Record<string, number> = {};
    for (const id of allPlayerIds) {
      const country = playerMap[id].team_id.toLowerCase();
      const grp = teamToGroup[country] || "unknown";
      if (grp !== "unknown") {
        groupCounts[grp] = (groupCounts[grp] || 0) + 1;
        if (groupCounts[grp] > 5) {
          return NextResponse.json(
            { error: `Grup limiti aşıldı! Aynı gruptan en fazla 5 oyuncu seçebilirsiniz. (Grup ${grp} aşılıyor)` },
            { status: 400 }
          );
        }
      }
    }

    // 7. Calculate and Validate Transfers & MinMat Games Constraint
    let newTransfers = 0;
    let prevTransfersMade = 0;

    if (prevRoster) {
      prevTransfersMade = prevRoster.transfers_made || 0;
      const prevPlayers = new Set([...(prevRoster.starters || []), ...(prevRoster.bench || [])]);
      const newPlayers = new Set(allPlayerIds);

      newPlayers.forEach((id) => {
        if (!prevPlayers.has(id)) {
          newTransfers++;
        }
      });
    }

    if (isStageActive && newTransfers > 0) {
      const minmatGamesToday = profile.minmatOyunSayisiBugun || 0;
      const requiredGamesToday = newTransfers * 3;
      if (minmatGamesToday < requiredGamesToday) {
        return NextResponse.json(
          {
            error: `Kadro güncellemesi kilitli! Aşama devam ederken yapılan her transfer için bugün en az 3 MinMat oyunu oynamış olmalısınız. Yapılan transfer sayısı: ${newTransfers}. Bugün oynadığınız oyun sayısı: ${minmatGamesToday}. Gereken oyun sayısı: ${requiredGamesToday}.`,
          },
          { status: 403 }
        );
      }
    }

    // 8. Save or Update Roster
    const finalTransfersCount = prevTransfersMade + (isStageActive ? newTransfers : 0);

    const rosterPayload = {
      user_id: userId,
      team_name: teamName,
      stage,
      formation,
      starters,
      bench,
      manager_id: managerId,
      transfers_made: finalTransfersCount,
      updated_at: new Date().toISOString(),
    };

    let saveError;
    if (prevRoster) {
      const { error } = await supabaseAdmin
        .from("fantasy_rosters")
        .update(rosterPayload)
        .eq("id", prevRoster.id);
      saveError = error;
    } else {
      const { error } = await supabaseAdmin.from("fantasy_rosters").insert({
        ...rosterPayload,
        team_index: teamIndex,
        points: 0,
      });
      saveError = error;
    }

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      message: "Kadronuz başarıyla kaydedildi.",
      transfersCount: newTransfers,
      totalTransfersMade: finalTransfersCount,
    });
  } catch (error: any) {
    console.error("POST roster error:", error);
    return NextResponse.json(
      { error: "Kadro kaydedilemedi", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
