import { kv } from "@vercel/kv";
import type { PredictionSubmission } from "@/lib/types/tournament";

const KV_KEY = "cupmat_leaderboard";

const defaultLeaderboard: PredictionSubmission[] = [
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

async function getStore(): Promise<PredictionSubmission[]> {
  try {
    const data = await kv.get<PredictionSubmission[]>(KV_KEY);
    return data || defaultLeaderboard;
  } catch (err) {
    console.error("KV Error loading cupmat leaderboard:", err);
    return defaultLeaderboard;
  }
}

export async function getLeaderboard(): Promise<PredictionSubmission[]> {
  const store = await getStore();
  return store.sort((a, b) => b.points - a.points);
}

export async function upsertSubmission(entry: PredictionSubmission): Promise<void> {
  const store = await getStore();
  const idx = store.findIndex((s) => s.userId === entry.userId);
  if (idx >= 0) {
    store[idx] = entry;
  } else {
    store.push(entry);
  }
  try {
    await kv.set(KV_KEY, store);
  } catch (err) {
    console.error("KV Error saving cupmat leaderboard:", err);
  }
}
