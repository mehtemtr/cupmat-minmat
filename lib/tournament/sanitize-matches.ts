import type { MatchResult } from "@/lib/types/tournament";
import { generateGroupFixtures } from "@/lib/fixtures";
import { getTeamById } from "@/data/teams";

/** Rebuild or filter matches so stale localStorage never references removed teams. */
export function sanitizeStoredMatches(
  stored: MatchResult[] | undefined,
): MatchResult[] {
  const official = generateGroupFixtures();

  if (!stored?.length) {
    return official;
  }

  const merged: MatchResult[] = [];

  for (const base of official) {
    // If the official fixture has been played, prioritize the official result
    if (base.played) {
      merged.push(base);
      continue;
    }

    const saved = stored.find((m) => m.id === base.id);
    if (!saved) {
      merged.push(base);
      continue;
    }

    const homeValid = getTeamById(saved.homeTeamId);
    const awayValid = getTeamById(saved.awayTeamId);

    if (
      saved.homeTeamId !== base.homeTeamId ||
      saved.awayTeamId !== base.awayTeamId ||
      !homeValid ||
      !awayValid
    ) {
      merged.push(base);
      continue;
    }

    merged.push({
      ...base,
      homeScore: saved.homeScore,
      awayScore: saved.awayScore,
      played: saved.played ?? false,
    });
  }

  return merged;
}
