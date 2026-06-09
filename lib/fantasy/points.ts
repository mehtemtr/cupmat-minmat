import { getAllPlayers } from "@/data/teams";
import { supabaseAdmin } from "@/lib/supabase";

export interface PlayerMapping {
  staticToUuid: Record<string, string>;
  uuidToStatic: Record<string, string>;
}

export function getGeneralPosition(pos: string): "GK" | "DEF" | "MID" | "FWD" {
  const p = pos?.toLowerCase() || "";
  if (p.includes("kaleci") || p.includes("gk")) return "GK";
  if (p.includes("defans") || p.includes("bek") || p.includes("stoper") || p.includes("df")) return "DEF";
  if (p.includes("orta saha") || p.includes("libero") || p.includes("midfielder") || p.includes("mf") || p.includes("açık")) return "MID";
  if (p.includes("forvet") || p.includes("fw")) return "FWD";
  return "FWD";
}

// Calculate score for a player based on stats and position
export function calculatePlayerPoints(stats: any, position: string): number {
  if (!stats) return 0;
  const pos = getGeneralPosition(position);
  let pts = 0;

  // 1. Appearance Points
  const mins = stats.minutes_played || 0;
  if (mins >= 60) pts += 2;
  else if (mins > 0) pts += 1;

  // 2. Goal Points by Position & Progressive Brace/Hat-trick Bonus
  const goals = stats.goals || 0;
  if (goals > 0) {
    let goalValue = 3; // Forward
    if (pos === "GK") goalValue = 10;
    else if (pos === "DEF") goalValue = 7;
    else if (pos === "MID") goalValue = 5;

    pts += goals * goalValue;

    // Multi-goal bonus
    if (goals === 2) pts += 2; // Brace bonus
    else if (goals >= 3) pts += 5; // Hat-trick bonus
  }

  // 3. Assist Points by Position
  const assists = stats.assists || 0;
  if (assists > 0) {
    let assistValue = 2; // Forward
    if (pos === "GK") assistValue = 5;
    else if (pos === "DEF") assistValue = 4;
    else if (pos === "MID") assistValue = 3;

    pts += assists * assistValue;
  }

  // 4. Clean Sheets (GK & DEF & MID)
  if (stats.clean_sheet) {
    if (pos === "GK") pts += 5;
    else if (pos === "DEF") pts += 4;
    else if (pos === "MID") pts += 1;
  }

  // 5. Conceded Goals Penalties (GK & DEF only)
  const conceded = stats.goals_conceded || 0;
  if (conceded > 0 && (pos === "GK" || pos === "DEF")) {
    pts -= conceded * 1;
  }

  // 6. Outcome & Goal Margin Points
  if (stats.team_result === "win") {
    pts += 5;
    // +1 pt for every 3-goal margin (e.g. 3-0, 4-1 wins)
    const margin = stats.goal_difference || 0;
    if (margin >= 3) {
      pts += Math.floor(margin / 3);
    }
  } else if (stats.team_result === "draw") {
    pts += 2;
  } else if (stats.team_result === "loss") {
    pts -= 2;
    // -1 pt for every 3-goal margin loss
    const margin = stats.goal_difference || 0; // Negative margin
    const absoluteMargin = Math.abs(margin);
    if (absoluteMargin >= 3) {
      pts -= Math.floor(absoluteMargin / 3);
    }
  }

  // 7. Cards & Penalties
  pts -= (stats.yellow_cards || 0) * 1;

  // Red Card Position Penalties
  const redCards = stats.red_cards || 0;
  if (redCards > 0) {
    if (pos === "FWD") pts -= 5;
    else if (pos === "MID") pts -= 4;
    else if (pos === "DEF") pts -= 3;
    else if (pos === "GK") pts -= 2;
  }

  // Own Goals Position Penalties
  const ownGoals = stats.own_goals || 0;
  if (ownGoals > 0) {
    if (pos === "FWD") pts -= ownGoals * 5;
    else if (pos === "MID") pts -= ownGoals * 4;
    else if (pos === "DEF") pts -= ownGoals * 3;
    else if (pos === "GK") pts -= ownGoals * 2;
  }

  // Goalkeeper saves (+1 pt per 3 saves)
  const saves = stats.saves || 0;
  if (saves >= 3 && pos === "GK") {
    pts += Math.floor(saves / 3);
  }

  // Penalty Actions
  pts += (stats.penalty_saved || 0) * 5;
  pts -= (stats.penalty_missed || 0) * 3;
  pts += (stats.penalty_earned || 0) * 2;
  pts -= (stats.penalty_conceded || 0) * 1;

  return pts;
}

export function getPlayerEvents(stats: any): string[] {
  if (!stats) return [];
  const events: string[] = [];
  if (stats.goals > 0) {
    events.push(`⚽ Gol x${stats.goals}`);
  }
  if (stats.assists > 0) {
    events.push(`🎯 Asist x${stats.assists}`);
  }
  if (stats.clean_sheet) {
    events.push("🛡️ Gol Yemedi");
  }
  if (stats.yellow_cards > 0) {
    events.push("🟨 Sarı Kart");
  }
  if (stats.red_cards > 0) {
    events.push("🟥 Kırmızı Kart");
  }
  if (stats.own_goals > 0) {
    events.push(`⚠️ Kendi Kalesine Gol x${stats.own_goals}`);
  }
  if (stats.penalty_saved > 0) {
    events.push(`🧤 Penaltı Kurtardı x${stats.penalty_saved}`);
  }
  if (stats.penalty_missed > 0) {
    events.push("❌ Penaltı Kaçırdı");
  }
  return events;
}

export async function getPlayerMapping(): Promise<PlayerMapping> {
  const staticPlayers = getAllPlayers();
  
  // Fetch all players from team_rosters (with pagination)
  const dbPlayers: any[] = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from("team_rosters")
      .select("id, team_id, player_name, player_position")
      .range(from, to);

    if (error) {
      console.error("Error fetching database players for mapping:", error);
      break;
    }

    if (data && data.length > 0) {
      dbPlayers.push(...data);
      if (data.length < 1000) {
        hasMore = false;
      } else {
        from += 1000;
        to += 1000;
      }
    } else {
      hasMore = false;
    }
  }

  const staticToUuid: Record<string, string> = {};
  const uuidToStatic: Record<string, string> = {};

  const normalizeName = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]/g, "");
  };

  const dbPlayerMap: Record<string, any[]> = {};
  dbPlayers.forEach((p) => {
    const tId = p.team_id.toLowerCase();
    if (!dbPlayerMap[tId]) dbPlayerMap[tId] = [];
    dbPlayerMap[tId].push(p);
  });

  const missingPlayers: any[] = [];

  for (const sp of staticPlayers) {
    const tId = sp.teamId.toLowerCase();
    const candidates = dbPlayerMap[tId] || [];
    const spNorm = normalizeName(sp.name);

    // Try exact match
    let match = candidates.find((c) => normalizeName(c.player_name) === spNorm);

    // Try partial containment match
    if (!match) {
      match = candidates.find((c) => {
        const cNorm = normalizeName(c.player_name);
        return cNorm.includes(spNorm) || spNorm.includes(cNorm);
      });
    }

    if (match) {
      staticToUuid[sp.id] = match.id;
      uuidToStatic[match.id] = sp.id;
    } else {
      missingPlayers.push(sp);
    }
  }

  // Insert any missing players on the fly
  if (missingPlayers.length > 0) {
    console.log(`Inserting ${missingPlayers.length} missing players from static data into team_rosters...`);
    for (const sp of missingPlayers) {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("team_rosters")
        .insert({
          team_id: sp.teamId,
          player_name: sp.name,
          player_position: sp.position === "GK" ? "Kaleci" : sp.position === "DF" ? "Defans" : sp.position === "MF" ? "Orta Saha" : "Forvet",
          player_number: 99,
          club: sp.club || "Serbest"
        })
        .select("id")
        .maybeSingle();

      if (insertError) {
        console.error(`Failed to insert missing player ${sp.name}:`, insertError);
      } else if (inserted) {
        staticToUuid[sp.id] = inserted.id;
        uuidToStatic[inserted.id] = sp.id;
      }
    }
  }

  return { staticToUuid, uuidToStatic };
}

export function translateToUuid(id: string, mapping: PlayerMapping): string | null {
  if (!id) return null;
  if (id.length === 36 && id.includes("-")) {
    return id; // already a UUID
  }
  return mapping.staticToUuid[id] || null;
}

export function translateToStatic(id: string, mapping: PlayerMapping): string | null {
  if (!id) return null;
  if (id.includes("-p")) {
    return id; // already a static ID
  }
  return mapping.uuidToStatic[id] || null;
}
