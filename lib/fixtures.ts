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
  const hourOffsetsUTC = ["13:00", "16:00", "19:00", "21:00"];

  // Matchday definitions: mapping matchday to pair indices of roundRobinPairs
  const matchdays = [
    [0, 5], // Matchday 1
    [1, 4], // Matchday 2
    [2, 3], // Matchday 3
  ];

  for (const mday of [0, 1, 2]) {
    const pairIndices = matchdays[mday];
    
    for (const group of GROUP_IDS) {
      const teams = getTeamsByGroup(group);
      const teamIds = teams.map((t) => t.id);
      const pairs = roundRobinPairs(teamIds);

      for (const pairIndex of pairIndices) {
        const [home, away] = pairs[pairIndex];
        
        const date = new Date(Date.UTC(2026, 5, 11));
        date.setUTCDate(date.getUTCDate() + Math.floor(dayOffset / 4));
        
        matches.push({
          id: `${group}-${pairIndex + 1}`, // Keep the same ID format group-1 to group-6
          group,
          homeTeamId: home,
          awayTeamId: away,
          homeScore: null,
          awayScore: null,
          played: false,
          date: date.toISOString().split("T")[0],
          time: hourOffsetsUTC[dayOffset % 4],
        });
        
        dayOffset++;
      }
    }
  }

  return matches;
}

export function sortMatchesChronologically(matches: MatchResult[]): MatchResult[] {
  return [...matches].sort((a, b) => {
    const dateTimeA = `${a.date}T${a.time || "00:00"}:00Z`;
    const dateTimeB = `${b.date}T${b.time || "00:00"}:00Z`;
    return new Date(dateTimeA).getTime() - new Date(dateTimeB).getTime();
  });
}

export function getMatchesForGroup(
  matches: MatchResult[],
  group: GroupId,
): MatchResult[] {
  return matches.filter((m) => m.group === group);
}
