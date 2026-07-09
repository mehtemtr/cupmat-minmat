import type { GroupId, KnockoutMatch, StandingRow, MatchResult } from "@/lib/types/tournament";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getTeamsByGroup, getTeamById } from "@/data/teams";
import { calculateStandingsFromMatches, groupMatchesComplete, sortStandings } from "@/lib/standings";
import { getMatchesForGroup } from "@/lib/fixtures";

export const KNOCKOUT_STATIC_RESULTS: Record<string, {
  homeScore: number;
  awayScore: number;
  homeET?: number | null;
  awayET?: number | null;
  homePen?: number | null;
  awayPen?: number | null;
  winnerId: string;
  played: boolean;
}> = {
  "r32-1": { homeScore: 0, awayScore: 1, winnerId: "can", played: true }, // South Africa vs Canada
  "r32-2": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 0, homePen: 2, awayPen: 3, winnerId: "mar", played: true }, // Netherlands vs Morocco
  "r32-3": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 0, homePen: 3, awayPen: 4, winnerId: "par", played: true }, // Germany vs Paraguay
  "r32-4": { homeScore: 3, awayScore: 0, winnerId: "fra", played: true }, // France vs Sweden
  "r32-5": { homeScore: 2, awayScore: 1, winnerId: "por", played: true }, // Portugal vs Croatia
  "r32-6": { homeScore: 3, awayScore: 0, winnerId: "esp", played: true }, // Spain vs Austria
  "r32-7": { homeScore: 2, awayScore: 0, winnerId: "usa", played: true }, // USA vs Bosnia-Herzegovina
  "r32-8": { homeScore: 3, awayScore: 2, winnerId: "bel", played: true }, // Belgium vs Senegal
  "r32-9": { homeScore: 2, awayScore: 1, winnerId: "bra", played: true }, // Brazil vs Japan
  "r32-10": { homeScore: 1, awayScore: 2, winnerId: "nor", played: true }, // Ivory Coast vs Norway
  "r32-11": { homeScore: 2, awayScore: 0, winnerId: "mex", played: true }, // Mexico vs Ecuador
  "r32-12": { homeScore: 2, awayScore: 1, winnerId: "eng", played: true }, // England vs DR Congo
  "r32-13": { homeScore: 2, awayScore: 0, winnerId: "sui", played: true }, // Switzerland vs Algeria
  "r32-14": { homeScore: 1, awayScore: 0, winnerId: "col", played: true }, // Colombia vs Ghana
  "r32-15": { homeScore: 2, awayScore: 2, homeET: 0, awayET: 0, homePen: 4, awayPen: 3, winnerId: "arg", played: true }, // Argentina vs Cape Verde
  "r32-16": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 0, homePen: 3, awayPen: 4, winnerId: "egy", played: true }, // Australia vs Egypt
  "r16-1": { homeScore: 0, awayScore: 3, winnerId: "mar", played: true }, // Canada vs Morocco
  "r16-2": { homeScore: 0, awayScore: 1, winnerId: "fra", played: true }, // Paraguay vs France
  "r16-3": { homeScore: 0, awayScore: 1, winnerId: "esp", played: true }, // Portugal vs Spain
  "r16-4": { homeScore: 1, awayScore: 4, winnerId: "bel", played: true }, // USA vs Belgium
  "r16-5": { homeScore: 1, awayScore: 2, winnerId: "nor", played: true }, // Brazil vs Norway
  "r16-6": { homeScore: 2, awayScore: 3, winnerId: "eng", played: true }, // Mexico vs England
  "r16-7": { homeScore: 0, awayScore: 0, homeET: 0, awayET: 0, homePen: 4, awayPen: 3, winnerId: "sui", played: true }, // Switzerland vs Colombia
  "r16-8": { homeScore: 3, awayScore: 2, winnerId: "arg", played: true }, // Argentina vs Egypt
};

// Definitions of official slots, dates, times, and stadiums for all rounds
export const R32_DEFS = [
  { id: "r32-1", slot: "R32-1", name: "Maç 73", homeSym: "A2", awaySym: "B2", date: "2026-06-28", time: "22:00", stadium: "Los Angeles Stadı" },
  { id: "r32-2", slot: "R32-2", name: "Maç 75", homeSym: "F1", awaySym: "C2", date: "2026-06-30", time: "04:00", stadium: "Monterrey Stadı" },
  { id: "r32-3", slot: "R32-3", name: "Maç 74", homeSym: "E1", awayOpts: ["A", "B", "C", "D", "F"] as GroupId[], date: "2026-06-29", time: "23:30", stadium: "Boston Stadı" },
  { id: "r32-4", slot: "R32-4", name: "Maç 77", homeSym: "I1", awayOpts: ["C", "D", "F", "G", "H"] as GroupId[], date: "2026-07-01", time: "00:00", stadium: "New York New Jersey Stadyumu" },
  { id: "r32-5", slot: "R32-5", name: "Maç 83", homeSym: "K2", awaySym: "L2", date: "2026-07-03", time: "02:00", stadium: "Toronto Stadı" },
  { id: "r32-6", slot: "R32-6", name: "Maç 84", homeSym: "H1", awaySym: "J2", date: "2026-07-02", time: "22:00", stadium: "Los Angeles Stadı" },
  { id: "r32-7", slot: "R32-7", name: "Maç 81", homeSym: "D1", awayOpts: ["B", "E", "F", "I", "J"] as GroupId[], date: "2026-07-02", time: "03:00", stadium: "San Francisco Bay Area Stadı" },
  { id: "r32-8", slot: "R32-8", name: "Maç 82", homeSym: "G1", awayOpts: ["A", "E", "H", "I", "J"] as GroupId[], date: "2026-07-01", time: "23:00", stadium: "Seattle Stadı" },
  { id: "r32-9", slot: "R32-9", name: "Maç 76", homeSym: "C1", awaySym: "F2", date: "2026-06-29", time: "20:00", stadium: "Houston Stadı" },
  { id: "r32-10", slot: "R32-10", name: "Maç 78", homeSym: "E2", awaySym: "I2", date: "2026-06-30", time: "20:00", stadium: "Dallas Stadı" },
  { id: "r32-11", slot: "R32-11", name: "Maç 79", homeSym: "A1", awayOpts: ["C", "E", "F", "H", "I"] as GroupId[], date: "2026-07-01", time: "04:00", stadium: "Mexico City Stadı" },
  { id: "r32-12", slot: "R32-12", name: "Maç 80", homeSym: "L1", awayOpts: ["E", "H", "I", "J", "K"] as GroupId[], date: "2026-07-01", time: "19:00", stadium: "Atlanta Stadı" },
  { id: "r32-13", slot: "R32-13", name: "Maç 85", homeSym: "B1", awayOpts: ["E", "F", "G", "I", "J"] as GroupId[], date: "2026-07-03", time: "06:00", stadium: "BC Place Vancouver Stadı" },
  { id: "r32-14", slot: "R32-14", name: "Maç 87", homeSym: "K1", awayOpts: ["D", "E", "I", "J", "L"] as GroupId[], date: "2026-07-04", time: "04:30", stadium: "Kansas City Stadı" },
  { id: "r32-15", slot: "R32-15", name: "Maç 86", homeSym: "J1", awaySym: "H2", date: "2026-07-04", time: "01:00", stadium: "Miami Stadı" },
  { id: "r32-16", slot: "R32-16", name: "Maç 88", homeSym: "D2", awaySym: "G2", date: "2026-07-03", time: "21:00", stadium: "Dallas Stadı" }
];

export const R16_DEFS = [
  { id: "r16-1", slot: "R16-1", name: "Maç 89", date: "2026-07-05", time: "00:00", stadium: "Philadelphia Stadı" },
  { id: "r16-2", slot: "R16-2", name: "Maç 90", date: "2026-07-04", time: "20:00", stadium: "Houston Stadı" },
  { id: "r16-3", slot: "R16-3", name: "Maç 93", date: "2026-07-06", time: "22:00", stadium: "Dallas Stadı" },
  { id: "r16-4", slot: "R16-4", name: "Maç 94", date: "2026-07-07", time: "03:00", stadium: "Seattle Stadı" },
  { id: "r16-5", slot: "R16-5", name: "Maç 91", date: "2026-07-05", time: "23:00", stadium: "New York New Jersey Stadı" },
  { id: "r16-6", slot: "R16-6", name: "Maç 92", date: "2026-07-06", time: "03:00", stadium: "Mexico City Stadı" },
  { id: "r16-7", slot: "R16-7", name: "Maç 96", date: "2026-07-07", time: "23:00", stadium: "BC Place Vancouver Stadı" },
  { id: "r16-8", slot: "R16-8", name: "Maç 95", date: "2026-07-07", time: "19:00", stadium: "Atlanta Stadı" }
];

export const QF_DEFS = [
  { id: "qf-1", slot: "QF-1", name: "Maç 97", date: "2026-07-09", time: "23:00", stadium: "Boston Stadı" },
  { id: "qf-2", slot: "QF-2", name: "Maç 98", date: "2026-07-10", time: "22:00", stadium: "Los Angeles Stadı" },
  { id: "qf-3", slot: "QF-3", name: "Maç 99", date: "2026-07-12", time: "00:00", stadium: "Miami Stadı" },
  { id: "qf-4", slot: "QF-4", name: "Maç 100", date: "2026-07-12", time: "04:00", stadium: "Kansas City Stadı" }
];

export const SF_DEFS = [
  { id: "sf-1", slot: "SF-1", name: "Maç 101", date: "2026-07-14", time: "22:00", stadium: "Dallas Stadı" },
  { id: "sf-2", slot: "SF-2", name: "Maç 102", date: "2026-07-15", time: "22:00", stadium: "Atlanta Stadı" }
];

export const FINAL_DEFS = [
  { id: "final-1", slot: "Final-1", name: "Maç 104", date: "2026-07-19", time: "22:00", stadium: "New York New Jersey Stadı" }
];

export const KNOCKOUT_DEFS = [
  ...R32_DEFS,
  ...R16_DEFS,
  ...QF_DEFS,
  ...SF_DEFS,
  ...FINAL_DEFS
];

export function buildFullKnockoutBracket(
  allMatches: MatchResult[],
  predictions: Record<string, { home: number; away: number; homeET?: number; awayET?: number; homePen?: number; awayPen?: number }>,
  groupTableOverrides?: Record<GroupId, string[]>,
  liveRawMatches?: any[]
): KnockoutMatch[] {
  const standingsMap = getGroupStandingsMap(allMatches, predictions, groupTableOverrides);

  // Check if we have teams resolved for group stages
  let totalResolvedTeams = 0;
  for (const group of GROUP_IDS) {
    totalResolvedTeams += standingsMap[group]?.length || 0;
  }

  if (totalResolvedTeams < 48) {
    return createPlaceholderBracket();
  }

  const r32Matches = buildR32Matches(standingsMap, predictions, liveRawMatches);
  const r16Matches = buildNextRound(r32Matches, predictions, "r16", 8, liveRawMatches);
  const qfMatches = buildNextRound(r16Matches, predictions, "qf", 4, liveRawMatches);
  const sfMatches = buildNextRound(qfMatches, predictions, "sf", 2, liveRawMatches);
  const finalMatch = buildNextRound(sfMatches, predictions, "final", 1, liveRawMatches);

  return [...r32Matches, ...r16Matches, ...qfMatches, ...sfMatches, ...finalMatch];
}

function buildR32Matches(
  standingsMap: Record<GroupId, StandingRow[]>,
  predictions?: Record<string, any>,
  liveRawMatches?: any[]
): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];

  // Get best 8 third place teams
  const thirdPlaceTeams: StandingRow[] = [];
  for (const group of GROUP_IDS) {
    const standings = standingsMap[group];
    if (standings[2]) {
      thirdPlaceTeams.push(standings[2]);
    }
  }
  const sortedThirdPlace = sortStandings(thirdPlaceTeams);
  const bestThirds = sortedThirdPlace.slice(0, 8).map((s) => s.teamId);

  const assignedThirds = new Set<string>();
  const getThirdPlaceForSlot = (allowedGroups: GroupId[], opponentGroup?: GroupId) => {
    for (const teamId of bestThirds) {
      if (assignedThirds.has(teamId)) continue;
      const group = getTeamById(teamId)?.group;
      if (group && allowedGroups.includes(group)) {
        if (opponentGroup && group === opponentGroup) {
          continue;
        }
        assignedThirds.add(teamId);
        return teamId;
      }
    }
    // Fallback 1: relax opponentGroup
    for (const teamId of bestThirds) {
      if (assignedThirds.has(teamId)) continue;
      const group = getTeamById(teamId)?.group;
      if (group && allowedGroups.includes(group)) {
        assignedThirds.add(teamId);
        return teamId;
      }
    }
    // Fallback 2: any unassigned
    for (const teamId of bestThirds) {
      if (assignedThirds.has(teamId)) continue;
      assignedThirds.add(teamId);
      return teamId;
    }
    return null;
  };

  const getThirdPlaceForGroup = (group: GroupId) => {
    const standings = standingsMap[group];
    return standings?.[2]?.teamId || null;
  };

  const qualifiedGroups = bestThirds.map(id => getTeamById(id)?.group).filter(Boolean) as GroupId[];
  const sortedCombo = [...qualifiedGroups].sort().join(",");
  const isDefaultCombo = sortedCombo === "B,D,E,F,G,I,J,L";

  // Pre-defined mapping for the default combo (Annex C 2026 Regulations)
  const defaultComboMap: Record<string, GroupId> = {
    "r32-3": "D",  // Home E1 (Germany) vs D3 (Paraguay)
    "r32-4": "F",  // Home I1 (France) vs F3 (Sweden)
    "r32-7": "B",  // Home D1 (USA) vs B3 (Bosnia-Herzegovina)
    "r32-8": "I",  // Home G1 (Belgium) vs I3 (Senegal)
    "r32-11": "E", // Home A1 (Mexico) vs E3 (Ecuador)
    "r32-12": "G", // Home L1 (England) vs G3 (Iran)
    "r32-13": "J", // Home B1 (Switzerland) vs J3 (Algeria)
    "r32-14": "L", // Home K1 (Colombia) vs L3 (Ghana)
  };

  const getTeamIdFromSym = (sym: string): string | null => {
    const match = sym.match(/^([A-L])([12])$/);
    if (!match) return null;
    const group = match[1] as GroupId;
    const rank = parseInt(match[2], 10) - 1;
    return standingsMap[group]?.[rank]?.teamId || null;
  };

  R32_DEFS.forEach((def) => {
    const homeTeamId = getTeamIdFromSym(def.homeSym);
    let awayTeamId: string | null = null;
    if (def.awaySym) {
      awayTeamId = getTeamIdFromSym(def.awaySym);
    } else if (def.awayOpts) {
      // Force user's specific Round of 32 pairings when predictions are empty or live scores are active
      const forceAwayMap: Record<string, string> = {
        "r32-3": "par",
        "r32-4": "swe",
        "r32-7": "bih",
        "r32-8": "sen",
        "r32-11": "ecu",
        "r32-12": "cod",
        "r32-13": "alg",
        "r32-14": "gha"
      };

      const useForced = !predictions || Object.keys(predictions).length === 0 || (liveRawMatches && liveRawMatches.length > 0);
      if (useForced && forceAwayMap[def.id]) {
        awayTeamId = forceAwayMap[def.id];
      } else if (isDefaultCombo && defaultComboMap[def.id]) {
        awayTeamId = getThirdPlaceForGroup(defaultComboMap[def.id]);
      } else {
        const homeTeam = homeTeamId ? getTeamById(homeTeamId) : null;
        awayTeamId = getThirdPlaceForSlot(def.awayOpts, homeTeam?.group);
      }
    }

    // Resolve real score/played status/winner from static results or live scores
    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let homeET: number | null = null;
    let awayET: number | null = null;
    let homePen: number | null = null;
    let awayPen: number | null = null;
    let played = false;
    let isLive = false;
    let winnerId: string | null = null;

    // Use static fallback results for already completed matches if available
    const staticRes = KNOCKOUT_STATIC_RESULTS[def.id];
    if (staticRes && homeTeamId && awayTeamId) {
      homeScore = staticRes.homeScore;
      awayScore = staticRes.awayScore;
      homeET = staticRes.homeET ?? null;
      awayET = staticRes.awayET ?? null;
      homePen = staticRes.homePen ?? null;
      awayPen = staticRes.awayPen ?? null;
      played = staticRes.played;
      winnerId = staticRes.winnerId;
    } else if (liveRawMatches && homeTeamId && awayTeamId) {
      const realMatch = liveRawMatches.find(rm => 
        (rm.homeTeamId === homeTeamId && rm.awayTeamId === awayTeamId) ||
        (rm.homeTeamId === awayTeamId && rm.awayTeamId === homeTeamId)
      );
      if (realMatch) {
        const isSwapped = realMatch.homeTeamId === awayTeamId;
        homeScore = isSwapped ? realMatch.awayScore : realMatch.homeScore;
        awayScore = isSwapped ? realMatch.homeScore : realMatch.awayScore;
        played = realMatch.played;
        isLive = realMatch.isLive;
        homeET = isSwapped ? realMatch.awayET : realMatch.homeET;
        awayET = isSwapped ? realMatch.homeET : realMatch.awayET;
        homePen = isSwapped ? realMatch.awayPen : realMatch.homePen;
        awayPen = isSwapped ? realMatch.homePen : realMatch.awayPen;

        // Subtract penalty goals from the fullTime score if they are included in it
        if (typeof homePen === "number" && typeof awayPen === "number" && homeScore !== null && awayScore !== null) {
          homeScore = homeScore - homePen;
          awayScore = awayScore - awayPen;
        }

        if (played && homeScore !== null && awayScore !== null) {
          if (homeScore > awayScore) {
            winnerId = homeTeamId;
          } else if (awayScore > homeScore) {
            winnerId = awayTeamId;
          } else {
            const hET = homeET ?? 0;
            const aET = awayET ?? 0;
            if (hET > aET) {
              winnerId = homeTeamId;
            } else if (aET > hET) {
              winnerId = awayTeamId;
            } else {
              const hPen = homePen ?? 0;
              const aPen = awayPen ?? 0;
              if (hPen > aPen) {
                winnerId = homeTeamId;
              } else if (aPen > hPen) {
                winnerId = awayTeamId;
              }
            }
          }
        }
      }
    }

    matches.push({
      id: def.id,
      round: "r32",
      slot: def.slot,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      homeET,
      awayET,
      homePen,
      awayPen,
      winnerId,
      played,
      isLive,
      date: def.date,
      time: def.time,
      stadium: def.stadium,
    });
  });

  return matches;
}

function buildNextRound(
  prevRoundMatches: KnockoutMatch[],
  predictions: Record<string, { home: number; away: number; homeET?: number; awayET?: number; homePen?: number; awayPen?: number; source?: "user" | "ai" }>,
  roundType: "r16" | "qf" | "sf" | "final",
  count: number,
  liveRawMatches?: any[]
): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];
  
  const roundDefs = {
    r16: R16_DEFS,
    qf: QF_DEFS,
    sf: SF_DEFS,
    final: FINAL_DEFS
  }[roundType];

  for (let i = 0; i < count; i++) {
    const prev1 = prevRoundMatches[i * 2];
    const prev2 = prevRoundMatches[i * 2 + 1];
    
    // User predicted winners take precedence, unless the match was actually played
    const homeTeamId = prev1 
      ? (prev1.played ? prev1.winnerId : (getWinner(prev1.id, prev1.homeTeamId, prev1.awayTeamId, predictions) || prev1.winnerId)) 
      : null;
    const awayTeamId = prev2 
      ? (prev2.played ? prev2.winnerId : (getWinner(prev2.id, prev2.homeTeamId, prev2.awayTeamId, predictions) || prev2.winnerId)) 
      : null;

    const def = roundDefs[i];
    const matchId = `${roundType}-${i + 1}`;
    const p = predictions[matchId];

    let homeScore: number | null = p?.home ?? null;
    let awayScore: number | null = p?.away ?? null;
    let homeET: number | null = p?.homeET ?? null;
    let awayET: number | null = p?.awayET ?? null;
    let homePen: number | null = p?.homePen ?? null;
    let awayPen: number | null = p?.awayPen ?? null;
    let played = false;
    let isLive = false;
    let winnerId: string | null = null;

    const staticRes = KNOCKOUT_STATIC_RESULTS[matchId];
    if (staticRes && homeTeamId && awayTeamId) {
      homeScore = staticRes.homeScore;
      awayScore = staticRes.awayScore;
      homeET = staticRes.homeET ?? null;
      awayET = staticRes.awayET ?? null;
      homePen = staticRes.homePen ?? null;
      awayPen = staticRes.awayPen ?? null;
      played = staticRes.played;
      winnerId = staticRes.winnerId;
    } else if (liveRawMatches && homeTeamId && awayTeamId) {
      const realMatch = liveRawMatches.find(rm => 
        (rm.homeTeamId === homeTeamId && rm.awayTeamId === awayTeamId) ||
        (rm.homeTeamId === awayTeamId && rm.awayTeamId === homeTeamId)
      );
      if (realMatch) {
        const isSwapped = realMatch.homeTeamId === awayTeamId;
        homeScore = isSwapped ? realMatch.awayScore : realMatch.homeScore;
        awayScore = isSwapped ? realMatch.homeScore : realMatch.awayScore;
        played = realMatch.played;
        isLive = realMatch.isLive;
        homeET = isSwapped ? realMatch.awayET : realMatch.homeET;
        awayET = isSwapped ? realMatch.homeET : realMatch.awayET;
        homePen = isSwapped ? realMatch.awayPen : realMatch.homePen;
        awayPen = isSwapped ? realMatch.homePen : realMatch.awayPen;

        // Subtract penalty goals from the fullTime score if they are included in it
        if (homePen !== null && awayPen !== null && homeScore !== null && awayScore !== null) {
          homeScore = homeScore - homePen;
          awayScore = awayScore - awayPen;
        }

        if (played && homeScore !== null && awayScore !== null) {
          if (homeScore > awayScore) {
            winnerId = homeTeamId;
          } else if (awayScore > homeScore) {
            winnerId = awayTeamId;
          } else {
            const hET = homeET ?? 0;
            const aET = awayET ?? 0;
            if (hET > aET) {
              winnerId = homeTeamId;
            } else if (aET > hET) {
              winnerId = awayTeamId;
            } else {
              const hPen = homePen ?? 0;
              const aPen = awayPen ?? 0;
              if (hPen > aPen) {
                winnerId = homeTeamId;
              } else if (aPen > hPen) {
                winnerId = awayTeamId;
              }
            }
          }
        }
      }
    }

    matches.push({
      id: `${roundType}-${i + 1}`,
      round: roundType,
      slot: def.slot,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      homeET,
      awayET,
      homePen,
      awayPen,
      winnerId,
      played,
      isLive,
      date: def.date,
      time: def.time,
      stadium: def.stadium,
    });
  }
  return matches;
}

function getWinner(
  matchId: string,
  homeId: string | null,
  awayId: string | null,
  predictions: Record<string, { home: number; away: number; homeET?: number; awayET?: number; homePen?: number; awayPen?: number }>
): string | null {
  if (!homeId || !awayId) return null;
  const p = predictions[matchId];
  if (!p) return null;
  
  if (p.home > p.away) return homeId;
  if (p.away > p.home) return awayId;

  // Extra Time
  if (p.homeET !== undefined && p.awayET !== undefined && p.homeET !== null && p.awayET !== null) {
    if (p.homeET > p.awayET) return homeId;
    if (p.awayET > p.homeET) return awayId;
  }

  // Penalties
  if (p.homePen !== undefined && p.awayPen !== undefined && p.homePen !== null && p.awayPen !== null) {
    if (p.homePen > p.awayPen) return homeId;
    if (p.awayPen > p.homePen) return awayId;
  }
  
  return homeId; 
}

export function buildRoundOf32(allMatches: MatchResult[]): KnockoutMatch[] {
  return buildFullKnockoutBracket(allMatches, {});
}

function createPlaceholderBracket(): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];
  
  R32_DEFS.forEach((def) => {
    matches.push({
      id: def.id,
      round: "r32",
      slot: def.slot,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: def.date,
      time: def.time,
      stadium: def.stadium,
    });
  });

  R16_DEFS.forEach((def) => {
    matches.push({
      id: def.id,
      round: "r16",
      slot: def.slot,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: def.date,
      time: def.time,
      stadium: def.stadium,
    });
  });

  QF_DEFS.forEach((def) => {
    matches.push({
      id: def.id,
      round: "qf",
      slot: def.slot,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: def.date,
      time: def.time,
      stadium: def.stadium,
    });
  });

  SF_DEFS.forEach((def) => {
    matches.push({
      id: def.id,
      round: "sf",
      slot: def.slot,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: def.date,
      time: def.time,
      stadium: def.stadium,
    });
  });

  FINAL_DEFS.forEach((def) => {
    matches.push({
      id: def.id,
      round: "final",
      slot: def.slot,
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: def.date,
      time: def.time,
      stadium: def.stadium,
    });
  });

  return matches;
}

export function allGroupsComplete(allMatches: MatchResult[], groupTableOverrides?: Record<GroupId, string[]>): boolean {
  return GROUP_IDS.every((g) => {
    if (groupTableOverrides && groupTableOverrides[g]) return true;
    return groupMatchesComplete(getMatchesForGroup(allMatches, g));
  });
}

export function getGroupStandingsMap(
  allMatches: MatchResult[],
  predictions: Record<string, { home: number; away: number }>,
  groupTableOverrides?: Record<GroupId, string[]>
): Record<GroupId, StandingRow[]> {
  const map = {} as Record<GroupId, StandingRow[]>;

  for (const group of GROUP_IDS) {
    const teams = getTeamsByGroup(group);
    const groupMatches = getMatchesForGroup(allMatches, group);
    
    // Merge actual results with predictions for the standings calculation
    const effectiveMatches = groupMatches.map(m => {
      if (m.played) return m;
      const p = predictions[m.id];
      if (p) {
        return { ...m, homeScore: p.home, awayScore: p.away, played: true };
      }
      return m;
    });

    let standings = calculateStandingsFromMatches(
      teams.map((t) => t.id),
      effectiveMatches,
    );

    // If there is an override for this group, sort by the manual order and assign synthetic stats
    if (groupTableOverrides && groupTableOverrides[group]) {
      const order = groupTableOverrides[group];
      const syntheticStats = [
        { points: 9, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, goalDifference: 5, played: 3 },
        { points: 6, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, played: 3 },
        { points: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, played: 3 },
        { points: 0, won: 0, drawn: 0, lost: 3, goalsFor: 0, goalsAgainst: 5, goalDifference: -5, played: 3 },
      ];

      standings = order.map((teamId, idx) => {
        const stats = syntheticStats[idx] || { points: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 3 };
        return {
          teamId,
          ...stats,
        };
      });
    }

    map[group] = standings;
  }

  return map;
}
