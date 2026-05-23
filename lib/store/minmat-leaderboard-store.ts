import { kv } from "@vercel/kv";

export interface MinMatScore {
  name: string;
  score: number;
  level: number;
  mode: string; // "add", "sub", "mul", "div", "mix"
  date: string;
  email?: string | null;
  timestamp?: number;
}

/** Son 72 saat ödül kürsüsü — tam skor kaydı + sıra */
export interface MinMatPodiumEntry extends MinMatScore {
  rank: number;
  displayName: string;
}

export const MINMAT_PODIUM_LIMIT = 3;

const REDIS_KEY = "minmat_leaderboard";

function normalizeMinMatScore(raw: MinMatScore): MinMatScore {
  const name =
    (typeof raw.name === "string" && raw.name.trim()) ||
    (raw.email ? String(raw.email).split("@")[0] : "") ||
    "Oyuncu";

  const score = Number(raw.score);
  const level = Number(raw.level);

  return {
    ...raw,
    name,
    score: Number.isFinite(score) ? score : 0,
    level: Number.isFinite(level) && level > 0 ? level : 1,
    mode: raw.mode || "mix",
    email: raw.email ?? null,
    timestamp: raw.timestamp ?? undefined,
    date: raw.date || "",
  };
}

async function getRawStore(): Promise<MinMatScore[]> {
  try {
    const data = await kv.get<MinMatScore[]>(REDIS_KEY);
    if (!data) return [];
    const list = Array.isArray(data)
      ? data
      : typeof data === "string"
        ? JSON.parse(data)
        : [];
    return (list as MinMatScore[]).map((item) => normalizeMinMatScore(item));
  } catch (err) {
    console.error("KV error:", err);
    return [];
  }
}

// 1. KATEGORİYE GÖRE FİLTRELEME VE İLK 10 KİŞİ LİMİTİ
export async function getMinMatLeaderboard(categoryFilter?: string): Promise<MinMatScore[]> {
  const store = await getRawStore();

  const sorted = store.sort((a, b) => b.score - a.score);

  if (categoryFilter && categoryFilter !== "all") {
    return sorted.filter((item) => item.mode === categoryFilter).slice(0, 10);
  }

  return sorted.slice(0, 10);
}

// 2. SON 72 SAATLİK ÖDÜL KÜRSÜSÜ — kullanıcı başına en iyi skor, tam isim/seviye
export async function getMinMatRewardPodium(): Promise<MinMatPodiumEntry[]> {
  const store = await getRawStore();
  const seventyTwoHoursAgo = Date.now() - 72 * 60 * 60 * 1000;

  const recent = store.filter(
    (item) =>
      item.email &&
      item.timestamp &&
      item.timestamp >= seventyTwoHoursAgo,
  );

  const bestByEmail = new Map<string, MinMatScore>();

  for (const item of recent) {
    const emailKey = String(item.email).trim().toLowerCase();
    const current = bestByEmail.get(emailKey);
    if (!current || item.score > current.score) {
      bestByEmail.set(emailKey, item);
    }
  }

  return Array.from(bestByEmail.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, MINMAT_PODIUM_LIMIT)
    .map((entry, index) => {
      const normalized = normalizeMinMatScore(entry);
      return {
        ...normalized,
        displayName: normalized.name,
        rank: index + 1,
      };
    });
}

// 3. YENİ PUAN EKLEME FONKSİYONU
export async function addMinMatScore(entry: MinMatScore): Promise<void> {
  const store = await getRawStore();

  const enrichedEntry = normalizeMinMatScore({
    ...entry,
    timestamp: entry.timestamp || Date.now(),
    date:
      entry.date ||
      new Date().toLocaleDateString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
  });

  store.push(enrichedEntry);

  const trimmedStore = store.sort((a, b) => b.score - a.score).slice(0, 200);

  try {
    await kv.set(REDIS_KEY, trimmedStore);
  } catch (err) {
    console.error("KV save error:", err);
  }
}
