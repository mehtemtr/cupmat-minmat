import { kv } from "@vercel/kv";
import * as fs from "fs";
import * as path from "path";
import type { PredictionSubmission } from "@/lib/types/tournament";

const KV_KEY = "cupmat_leaderboard";
const JSON_FILE_PATH = path.join(process.cwd(), "data", "cupmat-leaderboard.json");

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

async function getStoreFromKV(): Promise<PredictionSubmission[] | null> {
  try {
    const data = await kv.get<PredictionSubmission[]>(KV_KEY);
    if (data) return data;
  } catch (err) {
    console.warn("KV Error loading cupmat leaderboard, falling back to JSON:", err);
  }
  return null;
}

async function getStoreFromJSON(): Promise<PredictionSubmission[]> {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading cupmat leaderboard from JSON:", err);
  }
  return defaultLeaderboard;
}

async function getStore(): Promise<PredictionSubmission[]> {
  const kvData = await getStoreFromKV();
  if (kvData) return kvData;
  return getStoreFromJSON();
}

async function saveStoreToKV(scores: PredictionSubmission[]): Promise<boolean> {
  try {
    await kv.set(KV_KEY, scores);
    return true;
  } catch (err) {
    console.warn("KV Error saving cupmat leaderboard, falling back to JSON:", err);
    return false;
  }
}

async function saveStoreToJSON(scores: PredictionSubmission[]) {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(scores, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving cupmat leaderboard to JSON:", err);
  }
}

async function saveStore(scores: PredictionSubmission[]) {
  const kvSaved = await saveStoreToKV(scores);
  if (!kvSaved) {
    await saveStoreToJSON(scores);
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
  await saveStore(store);
}
