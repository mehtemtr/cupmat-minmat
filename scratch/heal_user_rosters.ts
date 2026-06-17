import { supabaseAdmin } from "../lib/supabase";
import { getGeneralPosition, getPlayerMapping } from "../lib/fantasy/points";
import { TEAMS } from "../data/teams";
import { OFFICIAL_GROUP_DRAW } from "../data/official-groups";

// Map country codes to World Cup Groups (A-L)
const teamToGroup: Record<string, string> = {};
for (const [group, teams] of Object.entries(OFFICIAL_GROUP_DRAW)) {
  for (const team of teams) {
    teamToGroup[team.toLowerCase()] = group;
  }
}

async function main() {
  const { data: allRosters, error: rErr } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("*");

  if (rErr) {
    console.error("Error loading rosters:", rErr);
    return;
  }

  // Load all players from team_rosters
  const { data: dbPlayers, error: pErr } = await supabaseAdmin
    .from("team_rosters")
    .select("id, player_position, team_id");

  if (pErr || !dbPlayers) {
    console.error("Error loading players:", pErr);
    return;
  }

  const dbPlayerIds = new Set(dbPlayers.map(p => p.id));
  console.log(`Loaded ${dbPlayers.length} players from team_rosters.`);

  // Group players by position
  const gks = dbPlayers.filter(p => getGeneralPosition(p.player_position) === "GK");
  const defs = dbPlayers.filter(p => getGeneralPosition(p.player_position) === "DEF");
  const mids = dbPlayers.filter(p => getGeneralPosition(p.player_position) === "MID");
  const fwds = dbPlayers.filter(p => getGeneralPosition(p.player_position) === "FWD");

  const positionPools = {
    GK: gks,
    DEF: defs,
    MID: mids,
    FWD: fwds
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  let healedCount = 0;

  for (const roster of allRosters) {
    const starters = roster.starters || [];
    const bench = roster.bench || [];

    const hasOrphans = [...starters, ...bench].some(id => !dbPlayerIds.has(id));
    if (!hasOrphans) continue;

    console.log(`Healing roster: "${roster.team_name}" [Stage: ${roster.stage}, User: ${roster.user_id}]`);

    // Determine limits
    let countryLimit = 3;
    const stg = roster.stage?.toLowerCase() || "";
    if (stg.includes("quarter")) countryLimit = 5;
    else if (stg.includes("semi") || stg.includes("final")) countryLimit = 7;
    else if (stg.includes("round")) countryLimit = 4;

    // Determine formation structure
    const formation = roster.formation || "4-4-2";
    const parts = formation.split("-").map(Number);
    const reqDEF = parts[0] || 4;
    const reqMID = parts[1] || 4;
    const reqFWD = parts[2] || 2;

    const starterPositions: ("GK" | "DEF" | "MID" | "FWD")[] = ["GK"];
    for (let i = 0; i < reqDEF; i++) starterPositions.push("DEF");
    for (let i = 0; i < reqMID; i++) starterPositions.push("MID");
    for (let i = 0; i < 11 - 1 - reqDEF - reqMID; i++) starterPositions.push("FWD");

    // Bench slots
    const allowedBenchSlots = bench.length;
    const getBenchDefaultPosition = (slotIdx: number, totalSlots: number): "GK" | "DEF" | "MID" | "FWD" => {
      if (totalSlots === 1) return "MID";
      if (totalSlots === 2) return slotIdx === 0 ? "MID" : "DEF";
      if (totalSlots === 3) return slotIdx === 0 ? "GK" : slotIdx === 1 ? "MID" : "DEF";
      if (slotIdx === 0) return "GK";
      if (slotIdx === 1) return "DEF";
      if (slotIdx === 2) return "MID";
      return "FWD";
    };

    // Shuffled pools
    const shufGks = shuffleArray(gks);
    const shufDefs = shuffleArray(defs);
    const shufMids = shuffleArray(mids);
    const shufFwds = shuffleArray(fwds);

    const pools = {
      GK: shufGks,
      DEF: shufDefs,
      MID: shufMids,
      FWD: shufFwds
    };

    const selectedIds = new Set<string>();
    const countryCounts: Record<string, number> = {};
    const groupCounts: Record<string, number> = {};

    const tryPickPlayer = (pos: "GK" | "DEF" | "MID" | "FWD", forceRelax = false): string | null => {
      const pool = pools[pos];
      for (const p of pool) {
        if (selectedIds.has(p.id)) continue;
        
        const country = p.team_id.toLowerCase();
        const grp = teamToGroup[country];

        if (!forceRelax) {
          if ((countryCounts[country] || 0) >= countryLimit) continue;
          if (grp && (groupCounts[grp] || 0) >= 5) continue;
        }

        selectedIds.add(p.id);
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        if (grp) groupCounts[grp] = (groupCounts[grp] || 0) + 1;
        return p.id;
      }

      if (!forceRelax) {
        return tryPickPlayer(pos, true);
      }
      return null;
    };

    // Build new starters
    const newStarters: string[] = [];
    for (let i = 0; i < 11; i++) {
      const pos = starterPositions[i];
      const pId = tryPickPlayer(pos);
      if (pId) newStarters.push(pId);
    }

    // Build new bench
    const newBench: string[] = [];
    for (let i = 0; i < allowedBenchSlots; i++) {
      const pos = getBenchDefaultPosition(i, allowedBenchSlots);
      const pId = tryPickPlayer(pos);
      if (pId) newBench.push(pId);
    }

    // Update in database
    const { error: updateErr } = await supabaseAdmin
      .from("fantasy_rosters")
      .update({
        starters: newStarters,
        bench: newBench,
        updated_at: new Date().toISOString()
      })
      .eq("id", roster.id);

    if (updateErr) {
      console.error(`Error updating roster ${roster.id}:`, updateErr);
    } else {
      healedCount++;
    }
  }

  console.log(`\nSuccessfully healed ${healedCount} rosters in the database.`);
}

main().catch(console.error);
