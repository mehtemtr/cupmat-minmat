import type { MatchResult, StandingRow } from "@/lib/types/tournament";

export function buildInitialStandings(
  teamIds: string[],
): Record<string, StandingRow> {
  return Object.fromEntries(
    teamIds.map((id) => [
      id,
      {
        teamId: id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]),
  );
}

export function calculateStandingsFromMatches(
  teamIds: string[],
  matches: MatchResult[],
): StandingRow[] {
  const rows = buildInitialStandings(teamIds);

  for (const match of matches) {
    if (
      !match.played ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    const home = rows[match.homeTeamId];
    const away = rows[match.awayTeamId];
    if (!home || !away) continue;

    const hs = match.homeScore;
    const as = match.awayScore;

    home.played += 1;
    away.played += 1;
    home.goalsFor += hs;
    home.goalsAgainst += as;
    away.goalsFor += as;
    away.goalsAgainst += hs;

    if (hs > as) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (hs < as) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return sortStandings(
    teamIds.map((id) => {
      const r = rows[id];
      return {
        ...r,
        goalDifference: r.goalsFor - r.goalsAgainst,
      };
    }),
  );
}

export function sortStandings(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId.localeCompare(b.teamId);
  });
}

export function groupMatchesComplete(matches: MatchResult[]): boolean {
  return matches.every(
    (m) => m.played && m.homeScore !== null && m.awayScore !== null,
  );
}
