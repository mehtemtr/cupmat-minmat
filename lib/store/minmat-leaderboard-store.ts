import { kv } from "@vercel/kv";

export interface MinMatScore {
  name: string;
  score: number;
  level: number;
  mode: string;
  date: string;
}

const KV_KEY = "minmat_leaderboard";

async function getStore(): Promise<MinMatScore[]> {
  try {
    const data = await kv.get<MinMatScore[]>(KV_KEY);
    if (data) return data;
  } catch (error) {
    console.error("KV Error loading minmat leaderboard:", error);
  }

  const defaultLeaderboard: MinMatScore[] = [
    { name: "Alperen", score: 150, level: 5, mode: "mix", date: new Date().toLocaleDateString("tr-TR") },
    { name: "Harun", score: 120, level: 4, mode: "mul", date: new Date().toLocaleDateString("tr-TR") },
    { name: "Mehtap", score: 90, level: 3, mode: "add", date: new Date().toLocaleDateString("tr-TR") }
  ];
  return defaultLeaderboard;
}

async function saveStore(scores: MinMatScore[]) {
  try {
    await kv.set(KV_KEY, scores);
  } catch (error) {
    console.error("KV Error saving minmat leaderboard:", error);
  }
}

export async function getMinMatLeaderboard(): Promise<MinMatScore[]> {
  const store = await getStore();
  return store.sort((a, b) => b.score - a.score);
}

export async function addMinMatScore(entry: MinMatScore): Promise<void> {
  const store = await getStore();
  store.push(entry);
  store.sort((a, b) => b.score - a.score);
  const trimmed = store.slice(0, 50);
  await saveStore(trimmed);
}
