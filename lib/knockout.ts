import type { GroupId, KnockoutMatch, StandingRow, MatchResult } from "@/lib/types/tournament";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getTeamsByGroup, getTeamById } from "@/data/teams";
import { calculateStandingsFromMatches, groupMatchesComplete, sortStandings } from "@/lib/standings";
import { getMatchesForGroup } from "@/lib/fixtures";

// Definitions of official slots, dates, times, and stadiums for all rounds
const R32_DEFS = [
  { id: "r32-1", slot: "R32-1", name: "Maç 74", homeSym: "E1", awayOpts: ["A", "B", "C", "D", "F"] as GroupId[], date: "2026-06-29", time: "23:30", stadium: "Boston Stadı" },
  { id: "r32-2", slot: "R32-2", name: "Maç 77", homeSym: "I1", awayOpts: ["C", "D", "F", "G", "H"] as GroupId[], date: "2026-07-01", time: "00:00", stadium: "New York New Jersey Stadyumu" },
  { id: "r32-3", slot: "R32-3", name: "Maç 73", homeSym: "A2", awaySym: "B2", date: "2026-06-28", time: "22:00", stadium: "Los Angeles Stadı" },
  { id: "r32-4", slot: "R32-4", name: "Maç 75", homeSym: "F1", awaySym: "C2", date: "2026-06-30", time: "04:00", stadium: "Monterrey Stadı" },
  { id: "r32-5", slot: "R32-5", name: "Maç 83", homeSym: "K2", awaySym: "L2", date: "2026-07-03", time: "02:00", stadium: "Toronto Stadı" },
  { id: "r32-6", slot: "R32-6", name: "Maç 84", homeSym: "H1", awaySym: "J2", date: "2026-07-02", time: "22:00", stadium: "Los Angeles Stadı" },
  { id: "r32-7", slot: "R32-7", name: "Maç 81", homeSym: "D1", awayOpts: ["B", "E", "F", "I", "J"] as GroupId[], date: "2026-07-02", time: "03:00", stadium: "San Francisco Bay Area Stadı" },
  { id: "r32-8", slot: "R32-8", name: "Maç 82", homeSym: "G1", awayOpts: ["A", "E", "H", "I", "J"] as GroupId[], date: "2026-07-01", time: "23:00", stadium: "Seattle Stadı" },
  { id: "r32-9", slot: "R32-9", name: "Maç 76", homeSym: "C1", awaySym: "F2", date: "2026-06-29", time: "20:00", stadium: "Houston Stadı" },
  { id: "r32-10", slot: "R32-10", name: "Maç 78", homeSym: "E2", awaySym: "I2", date: "2026-06-30", time: "20:00", stadium: "Dallas Stadı" },
  { id: "r32-11", slot: "R32-11", name: "Maç 79", homeSym: "A1", awayOpts: ["C", "E", "F", "H", "I"] as GroupId[], date: "2026-07-01", time: "04:00", stadium: "Mexico City Stadı" },
  { id: "r32-12", slot: "R32-12", name: "Maç 80", homeSym: "L1", awayOpts: ["E", "H", "I", "J", "K"] as GroupId[], date: "2026-07-01", time: "19:00", stadium: "Atlanta Stadı" },
  { id: "r32-13", slot: "R32-13", name: "Maç 86", homeSym: "J1", awaySym: "H2", date: "2026-07-04", time: "01:00", stadium: "Miami Stadı" },
  { id: "r32-14", slot: "R32-14", name: "Maç 88", homeSym: "D2", awaySym: "G2", date: "2026-07-03", time: "21:00", stadium: "Dallas Stadı" },
  { id: "r32-15", slot: "R32-15", name: "Maç 85", homeSym: "B1", awayOpts: ["E", "F", "G", "I", "J"] as GroupId[], date: "2026-07-03", time: "06:00", stadium: "BC Place Vancouver Stadı" },
  { id: "r32-16", slot: "R32-16", name: "Maç 87", homeSym: "K1", awayOpts: ["D", "E", "I", "J", "L"] as GroupId[], date: "2026-07-04", time: "04:30", stadium: "Kansas City Stadı" }
];

const R16_DEFS = [
  { id: "r16-1", slot: "R16-1", name: "Maç 89", date: "2026-07-05", time: "00:00", stadium: "Philadelphia Stadı" },
  { id: "r16-2", slot: "R16-2", name: "Maç 90", date: "2026-07-04", time: "20:00", stadium: "Houston Stadı" },
  { id: "r16-3", slot: "R16-3", name: "Maç 93", date: "2026-07-06", time: "22:00", stadium: "Dallas Stadı" },
  { id: "r16-4", slot: "R16-4", name: "Maç 94", date: "2026-07-07", time: "03:00", stadium: "Seattle Stadı" },
  { id: "r16-5", slot: "R16-5", name: "Maç 91", date: "2026-07-05", time: "23:00", stadium: "New York New Jersey Stadı" },
  { id: "r16-6", slot: "R16-6", name: "Maç 92", date: "2026-07-06", time: "03:00", stadium: "Mexico City Stadı" },
  { id: "r16-7", slot: "R16-7", name: "Maç 95", date: "2026-07-07", time: "19:00", stadium: "Atlanta Stadı" },
  { id: "r16-8", slot: "R16-8", name: "Maç 96", date: "2026-07-07", time: "23:00", stadium: "BC Place Vancouver Stadı" }
];

const QF_DEFS = [
  { id: "qf-1", slot: "QF-1", name: "Maç 97", date: "2026-07-09", time: "23:00", stadium: "Boston Stadı" },
  { id: "qf-2", slot: "QF-2", name: "Maç 98", date: "2026-07-10", time: "22:00", stadium: "Los Angeles Stadı" },
  { id: "qf-3", slot: "QF-3", name: "Maç 99", date: "2026-07-12", time: "00:00", stadium: "Miami Stadı" },
  { id: "qf-4", slot: "QF-4", name: "Maç 100", date: "2026-07-12", time: "04:00", stadium: "Kansas City Stadı" }
];

const SF_DEFS = [
  { id: "sf-1", slot: "SF-1", name: "Maç 101", date: "2026-07-14", time: "22:00", stadium: "Dallas Stadı" },
  { id: "sf-2", slot: "SF-2", name: "Maç 102", date: "2026-07-15", time: "22:00", stadium: "Atlanta Stadı" }
];

const FINAL_DEFS = [
  { id: "final-1", slot: "Final-1", name: "Maç 104", date: "2026-07-19", time: "22:00", stadium: "New York New Jersey Stadı" }
];

export function buildFullKnockoutBracket(
  allMatches: MatchResult[],
  predictions: Record<string, { home: number; away: number; homeET?: number; awayET?: number; homePen?: number; awayPen?: number }>,
  groupTableOverrides?: Record<GroupId, string[]>
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

  const r32Matches = buildR32Matches(standingsMap);
  const r16Matches = buildNextRound(r32Matches, predictions, "r16", 8);
  const qfMatches = buildNextRound(r16Matches, predictions, "qf", 4);
  const sfMatches = buildNextRound(qfMatches, predictions, "sf", 2);
  const finalMatch = buildNextRound(sfMatches, predictions, "final", 1);

  return [...r32Matches, ...r16Matches, ...qfMatches, ...sfMatches, ...finalMatch];
}

function buildR32Matches(standingsMap: Record<GroupId, StandingRow[]>): KnockoutMatch[] {
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
      const homeTeam = homeTeamId ? getTeamById(homeTeamId) : null;
      awayTeamId = getThirdPlaceForSlot(def.awayOpts, homeTeam?.group);
    }

    matches.push({
      id: def.id,
      round: "r32",
      slot: def.slot,
      homeTeamId,
      awayTeamId,
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

function buildNextRound(
  prevRoundMatches: KnockoutMatch[],
  predictions: Record<string, { home: number; away: number; homeET?: number; awayET?: number; homePen?: number; awayPen?: number; source?: "user" | "ai" }>,
  roundType: "r16" | "qf" | "sf" | "final",
  count: number
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
    
    const homeTeamId = prev1 ? getWinner(prev1.id, prev1.homeTeamId, prev1.awayTeamId, predictions) : null;
    const awayTeamId = prev2 ? getWinner(prev2.id, prev2.homeTeamId, prev2.awayTeamId, predictions) : null;

    const def = roundDefs[i];
    const p = predictions[`${roundType}-${i + 1}`];

    matches.push({
      id: `${roundType}-${i + 1}`,
      round: roundType,
      slot: def.slot,
      homeTeamId,
      awayTeamId,
      homeScore: p?.home ?? null,
      awayScore: p?.away ?? null,
      homeET: p?.homeET ?? null,
      awayET: p?.awayET ?? null,
      homePen: p?.homePen ?? null,
      awayPen: p?.awayPen ?? null,
      winnerId: null,
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
