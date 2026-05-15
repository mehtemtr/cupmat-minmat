import type { MatchResult } from "@/lib/types/tournament";

export function scorePrediction(
  predicted: { home: number; away: number },
  actual: MatchResult,
): number {
  if (
    !actual.played ||
    actual.homeScore === null ||
    actual.awayScore === null
  ) {
    return 0;
  }

  const ah = actual.homeScore;
  const aa = actual.awayScore;
  const ph = predicted.home;
  const pa = predicted.away;

  if (ph === ah && pa === aa) return 5;

  const actualOutcome =
    ah > aa ? "home" : ah < aa ? "away" : "draw";
  const predictedOutcome =
    ph > pa ? "home" : ph < pa ? "away" : "draw";

  if (actualOutcome === predictedOutcome) {
    const gdCorrect = ah - aa === ph - pa;
    return gdCorrect ? 3 : 2;
  }

  return 0;
}

export function totalPredictionPoints(
  predictions: Record<string, { home: number; away: number }>,
  actualMatches: MatchResult[],
): number {
  return actualMatches.reduce((sum, match) => {
    const pred = predictions[match.id];
    if (!pred) return sum;
    return sum + scorePrediction(pred, match);
  }, 0);
}
