import { Redis } from "@upstash/redis";

export interface MinMatScore {
  name: string;
  score: number;
  level: number;
  mode: string;
  date: string;
  email?: string | null; // Ödül tablosu 72 saatlik kontrolü için isteğe bağlı e-posta alanı
  timestamp?: number;    // Saat tabanlı filtreleme emniyeti için zaman damgası
}

// Upstash Redis istemcisi environment değişkenlerinden (UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN) otomatik beslenir
const redis = Redis.fromEnv();

const REDIS_KEY = "minmat_leaderboard";

const defaultLeaderboard: MinMatScore[] = [
  { name: "Kara", score: 150, level: 5, mode: "mix", date: new Date().toLocaleDateString("tr-TR"), timestamp: Date.now() },
  { name: "Kartal", score: 120, level: 4, mode: "mul", date: new Date().toLocaleDateString("tr-TR"), timestamp: Date.now() },
  { name: "Mehtap", score: 90, level: 3, mode: "add", date: new Date().toLocaleDateString("tr-TR"), timestamp: Date.now() }
];

async function getStore(): Promise<MinMatScore[]> {
  try {
    // Upstash Redis üzerinden veriyi çekiyoruz
    const data = await redis.get<MinMatScore[]>(REDIS_KEY);
    
    if (!data) {
      return defaultLeaderboard;
    }
    
    // Eğer veri array değilse veya string olarak geldiyse güvenli parse işlemi
    return Array.isArray(data) ? data : (typeof data === "string" ? JSON.parse(data) : defaultLeaderboard);
  } catch (err) {
    console.error("Upstash Redis Error loading minmat leaderboard:", err);
    return defaultLeaderboard;
  }
}

async function saveStore(scores: MinMatScore[]): Promise<void> {
  try {
    // Veriyi güncel Redis yapısıyla set ediyoruz
    await redis.set(REDIS_KEY, scores);
  } catch (err) {
    console.error("Upstash Redis Error saving minmat leaderboard:", err);
  }
}

export async function getMinMatLeaderboard(): Promise<MinMatScore[]> {
  const store = await getStore();
  // Skorları büyükten küçüğe sıralayarak döndürür
  return store.sort((a, b) => b.score - a.score);
}

export async function addMinMatScore(entry: MinMatScore): Promise<void> {
  const store = await getStore();
  
  // Eğer gelen veride timestamp yoksa otonom olarak şu anki zamanı ekler
  const enrichedEntry = {
    ...entry,
    timestamp: entry.timestamp || Date.now()
  };

  store.push(enrichedEntry);
  store.sort((a, b) => b.score - a.score);
  
  // Havuzun şişmesini engellemek için en yüksek 50 skoru tutar
  const trimmed = store.slice(0, 50);
  await saveStore(trimmed);
}