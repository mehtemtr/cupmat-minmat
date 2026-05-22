import { Redis } from "@upstash/redis";

export interface MinMatScore {
  name: string;
  score: number;
  level: number;
  mode: string; // "add", "sub", "mul", "div", "mix"
  date: string;
  email?: string | null;
  timestamp?: number;
}

const redis = Redis.fromEnv();
const REDIS_KEY = "minmat_leaderboard";

async function getRawStore(): Promise<MinMatScore[]> {
  try {
    const data = await redis.get<MinMatScore[]>(REDIS_KEY);
    if (!data) return [];
    return Array.isArray(data) ? data : (typeof data === "string" ? JSON.parse(data) : []);
  } catch (err) {
    console.error("Redis error:", err);
    return [];
  }
}

// 1. KATEGORİYE GÖRE FİLTRELEME VE İLK 10 KİŞİ LİMİTİ
export async function getMinMatLeaderboard(categoryFilter?: string): Promise<MinMatScore[]> {
  const store = await getRawStore();
  
  // Önce puana göre büyükten küçüğe sırala
  const sorted = store.sort((a, b) => b.score - a.score);
  
  // Eğer filtre "Hepsi" değilse ve belirli bir kategori seçildiyse filtrele
  if (categoryFilter && categoryFilter !== "all") {
    return sorted.filter(item => item.mode === categoryFilter).slice(0, 10);
  }
  
  // "Hepsi" seçildiyse doğrudan en yüksek ilk 10 kişiyi getir
  return sorted.slice(0, 10);
}

// 2. SON 72 SAATLİK ÖDÜL KÜRSÜSÜ (EN FAZLA 3 KULLANICI)
export async function getMinMatRewardPodium(): Promise<MinMatScore[]> {
  const store = await getRawStore();
  const seventyTwoHoursAgo = Date.now() - (72 * 60 * 60 * 1000);
  
  return store
    .filter(item => item.email && item.timestamp && item.timestamp >= seventyTwoHoursAgo) // Sadece mailli ve son 72 saatlik olanlar
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // En fazla 3 kişi
}

// 3. YENİ PUAN EKLEME FONKSİYONU
export async function addMinMatScore(entry: MinMatScore): Promise<void> {
  const store = await getRawStore();
  
  const enrichedEntry = {
    ...entry,
    timestamp: entry.timestamp || Date.now(),
    date: entry.date || new Date().toLocaleDateString("tr-TR")
  };

  store.push(enrichedEntry);
  
  // Havuzun şişmesini engellemek için toplamda en yüksek 200 skoru hafızada tut
  const trimmedStore = store.sort((a, b) => b.score - a.score).slice(0, 200);
  
  try {
    await redis.set(REDIS_KEY, trimmedStore);
  } catch (err) {
    console.error("Redis save error:", err);
  }
}
