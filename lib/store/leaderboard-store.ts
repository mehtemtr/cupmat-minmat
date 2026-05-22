import { Redis } from "@upstash/redis";
import type { PredictionSubmission } from "@/lib/types/tournament";

// Upstash Redis istemcisi environment değişkenlerinden otomatik beslenir
const redis = Redis.fromEnv();

const REDIS_KEY = "cupmat_leaderboard";

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
    // Upstash Redis üzerinden veriyi çekiyoruz
    const data = await redis.get<PredictionSubmission[]>(REDIS_KEY);
    
    if (!data) {
      return defaultLeaderboard;
    }
    
    // Veri array tipinde değilse veya string olarak döndüyse güvenli parse işlemi
    return Array.isArray(data) ? data : (typeof data === "string" ? JSON.parse(data) : defaultLeaderboard);
  } catch (err) {
    console.error("Upstash Redis Error loading cupmat leaderboard:", err);
    return defaultLeaderboard;
  }
}

export async function getLeaderboard(): Promise<PredictionSubmission[]> {
  const store = await getStore();

  // Eğer oyuncunun points değeri 0 ise veya yoksa, MinMat'taki asıl puanını (score) eşleştir
  const mappedStore = store.map(item => ({
    ...item,
    points: item.points || (item as any).score || 0
  }));

  // Oyuncuları gerçek puanlarına göre büyükten küçüğe sıralar
  return mappedStore.sort((a, b) => b.points - a.points);
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
    // Güncellenmiş havuzu Redis'e set ediyoruz
    await redis.set(REDIS_KEY, store);
  } catch (err) {
    console.error("Upstash Redis Error saving cupmat leaderboard:", err);
  }
}