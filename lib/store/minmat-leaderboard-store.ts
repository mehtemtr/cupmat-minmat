import { Redis } from "@upstash/redis";
import * as fs from "fs";
import * as path from "path";

export interface MinMatScore {
  name: string;
  score: number;
  level: number;
  mode: string;
  date: string;
}

const KV_KEY = "minmat_leaderboard";
const JSON_FILE_PATH = path.join(process.cwd(), "data", "minmat-leaderboard.json");

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      return redis;
    }
  } catch (error) {
    console.warn("Failed to initialize Upstash Redis, falling back to JSON:", error);
  }
  return null;
}

async function getStoreFromKV(): Promise<MinMatScore[] | null> {
  const r = getRedis();
  if (!r) return null;
  
  try {
    const data = await r.get<MinMatScore[]>(KV_KEY);
    if (data) return data;
  } catch (error) {
    console.warn("Redis Error loading minmat leaderboard, falling back to JSON:", error);
  }
  return null;
}

async function getStoreFromJSON(): Promise<MinMatScore[]> {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading minmat leaderboard from JSON:", error);
  }

  const defaultLeaderboard: MinMatScore[] = [
    { name: "Alperen", score: 150, level: 5, mode: "mix", date: new Date().toLocaleDateString("tr-TR") },
    { name: "Harun", score: 120, level: 4, mode: "mul", date: new Date().toLocaleDateString("tr-TR") },
    { name: "Mehtap", score: 90, level: 3, mode: "add", date: new Date().toLocaleDateString("tr-TR") }
  ];
  return defaultLeaderboard;
}

async function getStore(): Promise<MinMatScore[]> {
  const kvData = await getStoreFromKV();
  if (kvData) return kvData;
  return getStoreFromJSON();
}

async function saveStoreToKV(scores: MinMatScore[]): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  
  try {
    await r.set(KV_KEY, scores);
    return true;
  } catch (error) {
    console.warn("Redis Error saving minmat leaderboard, falling back to JSON:", error);
    return false;
  }
}

async function saveStoreToJSON(scores: MinMatScore[]) {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(scores, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving minmat leaderboard to JSON:", error);
  }
}

async function saveStore(scores: MinMatScore[]) {
  const kvSaved = await saveStoreToKV(scores);
  if (!kvSaved) {
    await saveStoreToJSON(scores);
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
