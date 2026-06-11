import type { GroupId, KnockoutMatch, StandingRow, MatchResult } from "@/lib/types/tournament";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getTeamsByGroup } from "@/data/teams";
import { calculateStandingsFromMatches, groupMatchesComplete, sortStandings } from "@/lib/standings";
import { getMatchesForGroup } from "@/lib/fixtures";

export function buildFullKnockoutBracket(
  allMatches: MatchResult[],
  predictions: Record<string, { home: number; away: number; homeET?: number; awayET?: number; homePen?: number; awayPen?: number }>,
  groupTableOverrides?: Record<GroupId, string[]>
): KnockoutMatch[] {
  const qualifiers: string[] = [];
  const thirdPlaceTeams: StandingRow[] = [];

  const standingsMap = getGroupStandingsMap(allMatches, predictions, groupTableOverrides);

  for (const group of GROUP_IDS) {
    const standings = standingsMap[group];
    
    qualifiers.push(...standings.slice(0, 2).map((s) => s.teamId));
    if (standings[2]) {
      thirdPlaceTeams.push(standings[2]);
    }
  }

  const sortedThirdPlace = sortStandings(thirdPlaceTeams);
  qualifiers.push(...sortedThirdPlace.slice(0, 8).map((s) => s.teamId));

  if (qualifiers.length < 32) {
    return createPlaceholderBracket();
  }

  const r32Matches = buildR32Matches(qualifiers);
  const r16Matches = buildNextRound(r32Matches, predictions, "r16", "R16", 8);
  const qfMatches = buildNextRound(r16Matches, predictions, "qf", "QF", 4);
  const sfMatches = buildNextRound(qfMatches, predictions, "sf", "SF", 2);
  const finalMatch = buildNextRound(sfMatches, predictions, "final", "Final", 1);

  return [...r32Matches, ...r16Matches, ...qfMatches, ...sfMatches, ...finalMatch];
}

function buildR32Matches(qualifiers: string[]): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];
  for (let i = 0; i < 16; i++) {
    const date = new Date(Date.UTC(2026, 5, 28 + Math.floor(i / 4)));
    matches.push({
      id: `r32-${i + 1}`,
      round: "r32",
      slot: `R32-${i + 1}`,
      homeTeamId: qualifiers[i * 2] || null,
      awayTeamId: qualifiers[i * 2 + 1] || null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      date: date.toISOString().split("T")[0],
    });
  }
  return matches;
}

function buildNextRound(
  prevRoundMatches: KnockoutMatch[],
  predictions: Record<string, { home: number; away: number; homeET?: number; awayET?: number; homePen?: number; awayPen?: number; source?: "user" | "ai" }>,
  roundType: "r16" | "qf" | "sf" | "final",
  slotPrefix: string,
  count: number
): KnockoutMatch[] {
  const matches: KnockoutMatch[] = [];
  
  const roundDates: Record<string, number> = {
    r16: 4,  // July 4
    qf: 9,   // July 9
    sf: 14,  // July 14
    final: 19 // July 19
  };

  for (let i = 0; i < count; i++) {
    const prev1 = prevRoundMatches[i * 2];
    const prev2 = prevRoundMatches[i * 2 + 1];
    
    const homeTeamId = prev1 ? getWinner(prev1.id, prev1.homeTeamId, prev1.awayTeamId, predictions) : null;
    const awayTeamId = prev2 ? getWinner(prev2.id, prev2.homeTeamId, prev2.awayTeamId, predictions) : null;

    const date = new Date(Date.UTC(2026, 6, roundDates[roundType] + Math.floor(i / 2)));

    const p = predictions[`${roundType}-${i + 1}`];

    matches.push({
      id: `${roundType}-${i + 1}`,
      round: roundType,
      slot: `${slotPrefix}-${i + 1}`,
      homeTeamId,
      awayTeamId,
      homeScore: p?.home ?? null,
      awayScore: p?.away ?? null,
      homeET: p?.homeET ?? null,
      awayET: p?.awayET ?? null,
      homePen: p?.homePen ?? null,
      awayPen: p?.awayPen ?? null,
      winnerId: null,
      date: date.toISOString().split("T")[0],
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
  return Array.from({ length: 16 }, (_, i) => ({
    id: `r32-${i + 1}`,
    round: "r32" as const,
    slot: `R32-${i + 1}`,
    homeTeamId: null,
    awayTeamId: null,
    homeScore: null,
    awayScore: null,
    winnerId: null,
    date: "",
  }));
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
