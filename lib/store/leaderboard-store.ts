import type { PredictionSubmission } from "@/lib/types/tournament";

const globalStore = globalThis as unknown as {
  leaderboard?: PredictionSubmission[];
};

function getStore(): PredictionSubmission[] {
  if (!globalStore.leaderboard) {
    globalStore.leaderboard = [
      {
        userId: "demo-1",
        displayName: "Kara",
        matchPredictions: {},
        points: 0,
        groupsComplete: true,
        submittedAt: new Date().toISOString(),
      },
      {
        userId: "demo-2",
        displayName: "Kartal",
        matchPredictions: {},
        points: 0,
        groupsComplete: true,
        submittedAt: new Date().toISOString(),
      },
      {
        userId: "demo-3",
        displayName: "WC2026_TR",
        matchPredictions: {},
        points: 0,
        groupsComplete: false,
        submittedAt: new Date().toISOString(),
      },
    ];
  }
  return globalStore.leaderboard!;
}

export function getLeaderboard(): PredictionSubmission[] {
  return [...getStore()].sort((a, b) => b.points - a.points);
}

export function upsertSubmission(entry: PredictionSubmission): void {
  const store = getStore();
  const idx = store.findIndex((s) => s.userId === entry.userId);
  if (idx >= 0) store[idx] = entry;
  else store.push(entry);
}
