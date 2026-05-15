import type { GroupId, MatchResult } from "@/lib/types/tournament";
import { GROUP_IDS } from "@/lib/types/tournament";
import { getTeamsByGroup } from "@/data/teams";

function roundRobinPairs(teamIds: string[]): [string, string][] {
  const pairs: [string, string][] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairs.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairs;
}

export function generateGroupFixtures(): MatchResult[] {
  const matches: MatchResult[] = [];
  let dayOffset = 0;

  for (const group of GROUP_IDS) {
    const teams = getTeamsByGroup(group);
    const pairs = roundRobinPairs(teams.map((t) => t.id));

    pairs.forEach(([home, away], index) => {
      // Simple logic: 4 matches per day
      const date = new Date(2026, 5, 11);
      date.setDate(date.getDate() + Math.floor(dayOffset / 4));
      
      matches.push({
        id: `${group}-${index + 1}`,
        group,
        homeTeamId: home,
        awayTeamId: away,
        homeScore: null,
        awayScore: null,
        played: false,
        date: date.toISOString().split("T")[0],
      });
      dayOffset++;
    });
  }

  return matches;
}

export function getMatchesForGroup(
  matches: MatchResult[],
  group: GroupId,
): MatchResult[] {
  return matches.filter((m) => m.group === group);
}
