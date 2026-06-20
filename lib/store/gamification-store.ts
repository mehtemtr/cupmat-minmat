import { Redis } from "@upstash/redis";
import { supabaseAdmin } from "@/lib/supabase";
import { getLeaderboard } from "@/lib/store/leaderboard-store";
import {
  applyCupmatPeriodReward,
  applyMinmatPeriodReward,
  clearPeriodRewardFields,
  expirePeriodRewardsIfNeeded,
  getActiveCupmatGlobalBonus,
  getPeriodStart,
  parseTrDate,
  scheduleNextPeriodEnd,
  enrichProfileWithPeriodRewards as enrichProfileWithPeriodRewardsFn,
  type ProfileWithPeriodRewards as ProfileWithPeriodRewardsBase,
} from "@/lib/gamification/period-rewards";

export type ProfileWithPeriodRewards = ProfileWithPeriodRewardsBase<UserActivity>;

export interface UserActivity {
  userId: string;
  displayName: string;
  email?: string;                 // User email from Clerk
  taraftarPuani: number;          // Cupmat activity points
  gunlukGirisSayisi: number;       // Logins within the current day
  sonGirisTarihi: string;          // Last login date (YYYY-MM-DD)
  minmatEkSure: number;            // Günlük/keşif ek süre (anında kullanılır, periyot ödülü değil)
  tahminGuncellemeHakki: number;   // Cupmat prediction change rights
  yardimTiklandi: boolean;         // Daily help clicked check
  hakkindaTiklandi: boolean;       // Daily about clicked check
  mevcutPeriyotPuani: number;      // Current 3-day period score
  genelTahminHakkiKullanildi: boolean; // 1-time free initial predictions used
  minmatOyunSayisiBugun: number;
  minmatHighestLevelToday: number; // Highest MinMat level reached today   // Number of Minmat games played today
  lastClerkLoginAt: string | null;  // Last Clerk email login timestamp
  activeSecondsInPeriod: number;    // Seconds tracked in the current period
  /** Önceki periyot CupMat ilk3 → bu periyot MinMat: tur başına ek saniye */
  periyotOdulMinmatSaniyeSeviye: number;
  /** Önceki periyot CupMat ilk3 → bu periyot MinMat: Eşleşme başına ek puan */
  periyotOdulMinmatPuanSeviye: number;
  /** Önceki periyot MinMat ilk3 → bu periyot CupMat: Ek global puan */
  periyotOdulCupmatGlobalPuan: number;
  /** Aktif ödülün geçerli olduğu periyot bitişi (store.periodEnd ile eşleşir) */
  periyotOdulGecerliBitis: string;
  /** @deprecated Eski alan — yeni periyot ödülleri yukarıdaki alanlarda */
  cupMatRewardSeconds: number;
  cupMatRewardPoints: number;
  minmatMaxLevels?: { add: number; sub: number; mul: number; div: number; mix: number };
  minmatUnlockedModes?: { sub: boolean; mul: boolean; div: boolean; mix: boolean };
  minmatGamesPlayedCount?: { add: number; sub: number; mul: number; div: number; mix: number };
  lastPageStayClaimAt: string;     // ISO string of the last page stay claim
  pageStayClaimsTodayCount: number; // Number of page stay sessions today
  pageStayHistory: Record<string, { lastClaimedAt: string; claimsTodayCount: number }>;
  minmatBoostTimeCharges?: number;
  minmatBoostLifeCharges?: number;
  minmatBoostScoreCharges?: number;
  minmatBoostExpiresAt?: string;
}

function normalizeUserActivity(raw: Partial<UserActivity> & { userId: string }): UserActivity {
  return {
    userId: raw.userId,
    displayName: raw.displayName || `Oyuncu-${raw.userId.substring(0, 5)}`,
    email: raw.email || "",
    taraftarPuani: raw.taraftarPuani ?? 0,
    gunlukGirisSayisi: raw.gunlukGirisSayisi ?? 0,
    sonGirisTarihi: raw.sonGirisTarihi ?? "",
    minmatEkSure: raw.minmatEkSure ?? 0,
    tahminGuncellemeHakki: raw.tahminGuncellemeHakki ?? 0,
    yardimTiklandi: raw.yardimTiklandi ?? false,
    hakkindaTiklandi: raw.hakkindaTiklandi ?? false,
    mevcutPeriyotPuani: raw.mevcutPeriyotPuani ?? 0,
    genelTahminHakkiKullanildi: raw.genelTahminHakkiKullanildi ?? false,
    minmatOyunSayisiBugun: raw.minmatOyunSayisiBugun ?? 0,
    minmatHighestLevelToday: raw.minmatHighestLevelToday ?? 0,
    lastClerkLoginAt: raw.lastClerkLoginAt ?? null,
    activeSecondsInPeriod: raw.activeSecondsInPeriod ?? 0,
    periyotOdulMinmatSaniyeSeviye: raw.periyotOdulMinmatSaniyeSeviye ?? 0,
    periyotOdulMinmatPuanSeviye: raw.periyotOdulMinmatPuanSeviye ?? 0,
    periyotOdulCupmatGlobalPuan: raw.periyotOdulCupmatGlobalPuan ?? 0,
    periyotOdulGecerliBitis: raw.periyotOdulGecerliBitis ?? "",
    cupMatRewardSeconds: 0,
    cupMatRewardPoints: 0,
    minmatMaxLevels: raw.minmatMaxLevels ?? { add: 1, sub: 1, mul: 1, div: 1, mix: 1 },
    minmatUnlockedModes: raw.minmatUnlockedModes ?? { sub: false, mul: false, div: false, mix: false },
    minmatGamesPlayedCount: raw.minmatGamesPlayedCount ?? { add: 0, sub: 0, mul: 0, div: 0, mix: 0 },
    lastPageStayClaimAt: raw.lastPageStayClaimAt ?? "",
    pageStayClaimsTodayCount: raw.pageStayClaimsTodayCount ?? 0,
    pageStayHistory: raw.pageStayHistory ?? {},
    minmatBoostTimeCharges: raw.minmatBoostTimeCharges ?? 0,
    minmatBoostLifeCharges: raw.minmatBoostLifeCharges ?? 0,
    minmatBoostScoreCharges: raw.minmatBoostScoreCharges ?? 0,
    minmatBoostExpiresAt: raw.minmatBoostExpiresAt ?? "",
  };
}

function isEmailEligible(user: UserActivity): boolean {
  return user.userId.startsWith("user_");
}

export interface GecmisSampiyon {
  userId: string;
  displayName: string;
  derece: number;                  // Rank (1, 2, or 3)
  periyotBitisTarihi: string;      // Reset date
}

interface GamificationStore {
  userActivities: UserActivity[];
  gecmisSampiyonlar: GecmisSampiyon[];
  periodEnd: string;               // ISO date string of current period end
}

// Upstash Redis istemcisi environment değişkenlerinden otomatik beslenir
const redis = Redis.fromEnv();

const REDIS_KEY = "gamification_store";

// Sabit başlangıç zamanı: 25 Mayıs 2026 Pazartesi 00:00:00 UTC
const FIXED_PERIOD_START = new Date(Date.UTC(2026, 4, 25, 0, 0, 0, 0)); // Ay 0-indexli (Mayıs = 4)
const PERIOD_DURATION_MS = 72 * 60 * 60 * 1000; // 72 saat = 3 gün

/**
 * Sabit zaman çizelgesine göre güncel periyot bitiş zamanını hesaplar
 */
function calculateCurrentPeriodEnd(): Date {
  const now = Date.now();
  
  if (now < FIXED_PERIOD_START.getTime()) {
    return new Date(FIXED_PERIOD_START.getTime() + PERIOD_DURATION_MS);
  }

  const elapsedSinceStart = now - FIXED_PERIOD_START.getTime();
  const periodsCompleted = Math.floor(elapsedSinceStart / PERIOD_DURATION_MS);
  const currentPeriodEnd = new Date(
    FIXED_PERIOD_START.getTime() + (periodsCompleted + 1) * PERIOD_DURATION_MS
  );

  return currentPeriodEnd;
}

// Varsayılan periyot sonu tarihi - sabit hesaplamaya göre
const defaultPeriodEnd = calculateCurrentPeriodEnd();

const defaultStore: GamificationStore = {
  userActivities: [
    {
      userId: "demo-1",
      displayName: "Kara",
      taraftarPuani: 23,
      gunlukGirisSayisi: 1,
      sonGirisTarihi: new Date().toISOString().split("T")[0],
      minmatEkSure: 10,
      tahminGuncellemeHakki: 2,
      yardimTiklandi: true,
      hakkindaTiklandi: false,
      mevcutPeriyotPuani: 23,
      genelTahminHakkiKullanildi: false,
      minmatOyunSayisiBugun: 6,
      lastClerkLoginAt: null,
      activeSecondsInPeriod: 0,
      periyotOdulMinmatSaniyeSeviye: 0,
      periyotOdulMinmatPuanSeviye: 0,
      periyotOdulCupmatGlobalPuan: 0,
      periyotOdulGecerliBitis: "",
      cupMatRewardSeconds: 0,
      cupMatRewardPoints: 0,
      minmatMaxLevels: { add: 1, sub: 1, mul: 1, div: 1, mix: 1 },
      lastPageStayClaimAt: "",
      pageStayClaimsTodayCount: 0,
      pageStayHistory: {},
      minmatBoostTimeCharges: 0,
      minmatBoostLifeCharges: 0,
      minmatBoostScoreCharges: 0,
      minmatBoostExpiresAt: "",
    },
    {
      userId: "demo-2",
      displayName: "Kartal",
      taraftarPuani: 19,
      gunlukGirisSayisi: 2,
      sonGirisTarihi: new Date().toISOString().split("T")[0],
      minmatEkSure: 5,
      tahminGuncellemeHakki: 1,
      yardimTiklandi: false,
      hakkindaTiklandi: true,
      mevcutPeriyotPuani: 19,
      genelTahminHakkiKullanildi: false,
      minmatOyunSayisiBugun: 3,
      lastClerkLoginAt: null,
      activeSecondsInPeriod: 0,
      periyotOdulMinmatSaniyeSeviye: 0,
      periyotOdulMinmatPuanSeviye: 0,
      periyotOdulCupmatGlobalPuan: 0,
      periyotOdulGecerliBitis: "",
      cupMatRewardSeconds: 0,
      cupMatRewardPoints: 0,
      minmatMaxLevels: { add: 1, sub: 1, mul: 1, div: 1, mix: 1 },
      lastPageStayClaimAt: "",
      pageStayClaimsTodayCount: 0,
      pageStayHistory: {},
      minmatBoostTimeCharges: 0,
      minmatBoostLifeCharges: 0,
      minmatBoostScoreCharges: 0,
      minmatBoostExpiresAt: "",
    }
  ],
  gecmisSampiyonlar: [
    {
      userId: "champ-1",
      displayName: "WorldCupGuru",
      derece: 1,
      periyotBitisTarihi: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  periodEnd: defaultPeriodEnd.toISOString(),
};

export async function getStore(): Promise<GamificationStore> {
  try {
    // Upstash Redis üzerinden veriyi çekiyoruz
    const data = await redis.get<GamificationStore>(REDIS_KEY);
    
    if (!data) {
      return defaultStore;
    }

    // Gelen veri nesne tipinde değilse veya string olarak döndüyse güvenli parse katmanı
    if (typeof data === "string") {
      return JSON.parse(data);
    }

    const normalized: GamificationStore = {
      ...data,
      userActivities: (data.userActivities || []).map((u) =>
        normalizeUserActivity(u),
      ),
      gecmisSampiyonlar: data.gecmisSampiyonlar || [],
      periodEnd: data.periodEnd || defaultStore.periodEnd,
    };
    return normalized;
  } catch (error) {
    console.error("Upstash Redis Error loading gamification store", error);
    return defaultStore;
  }
}

export async function saveStore(store: GamificationStore): Promise<void> {
  try {
    // Güncellenmiş nesneyi Redis'e set ediyoruz
    await redis.set(REDIS_KEY, store);
  } catch (error) {
    console.error("Upstash Redis Error saving gamification store", error);
  }
}

/**
 * Biten periyodun kazananlarını hesaplar, tüm eski periyot ödüllerini siler,
 * kazananlara YALNIZCA yeni 3 günlük periyot için ödül tanımlar (hemen aktif değil — yeni periyot başında geçerli).
 */
async function transitionToNextPeriod(store: GamificationStore): Promise<void> {
  const endingPeriodEnd = store.periodEnd;
  const compareStart = getPeriodStart(endingPeriodEnd);
  const predictions = await getLeaderboard();
  
  // Dönem sıfırlamasında minmat_leaderboard'da güncelleme yapmaya gerek yoktur (zaman damgası üzerinden hesaplanır)

  // Şampiyon arşivi (dönem puanına göre)
  const periodChampions = [...store.userActivities]
    .filter((u) => u.mevcutPeriyotPuani > 0)
    .sort((a, b) => b.mevcutPeriyotPuani - a.mevcutPeriyotPuani)
    .slice(0, 3);

  periodChampions.forEach((user, index) => {
    store.gecmisSampiyonlar.push({
      userId: user.userId,
      displayName:
        user.displayName || `Kullanıcı-${user.userId.substring(0, 5)}`,
      derece: index + 1,
      periyotBitisTarihi: endingPeriodEnd,
    });
  });

  // CupMat ödül sıralaması (birleşik puan)
  const cupTop3 = [...store.userActivities]
    .filter(isEmailEligible)
    .map((u) => ({
      user: u,
      combined:
        u.mevcutPeriyotPuani +
        (predictions.find((p) => p.userId === u.userId)?.points || 0) * 10,
    }))
    .sort((a, b) => b.combined - a.combined)
    .slice(0, 3)
    .map((row) => row.user);

  // MinMat ödül sıralaması (dönem içi en yüksek skor - in-memory e-posta/isim eşleştirmesi)
  const eligibleUsers = store.userActivities.filter(isEmailEligible);
  
  const { data: periodScoresList, error: scoresError } = await supabaseAdmin
    .from("minmat_leaderboard")
    .select("*")
    .gte("timestamp", compareStart.getTime());

  if (scoresError) {
    console.error("Error fetching minmat scores in transitionToNextPeriod:", scoresError);
  }

  const minMatMaxByUserIdMap: Record<string, number> = {};
  const userIdToUserMap = new Map<string, UserActivity>();

  eligibleUsers.forEach(u => {
    userIdToUserMap.set(u.userId, u);
  });

  if (periodScoresList) {
    for (const s of periodScoresList) {
      const emailKey = s.email?.toLowerCase().trim() || "";
      const nameKey = s.name?.toLowerCase().trim() || "";

      const matchingUser = eligibleUsers.find((u) => 
        (emailKey && u.email?.toLowerCase().trim() === emailKey) || 
        (nameKey && u.displayName.toLowerCase().trim() === nameKey)
      );

      if (matchingUser) {
        const userId = matchingUser.userId;
        minMatMaxByUserIdMap[userId] = Math.max(minMatMaxByUserIdMap[userId] || 0, s.score || 0);
      }
    }
  }

  const minTop3 = Object.entries(minMatMaxByUserIdMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([userId]) => userIdToUserMap.get(userId))
    .filter((u): u is UserActivity => !!u);

  const newPeriodEnd = scheduleNextPeriodEnd();

  // Tüm kullanıcılar: eski periyot ödülleri ve dönem sayaçları sıfırlanır
  store.userActivities.forEach((u) => {
    clearPeriodRewardFields(u);

    if (u.displayName === "Kara") {
      u.mevcutPeriyotPuani = 23;
      u.taraftarPuani = 23;
    } else if (u.displayName === "Kartal") {
      u.mevcutPeriyotPuani = 19;
      u.taraftarPuani = 19;
    } else {
      u.mevcutPeriyotPuani = 0;
    }

    u.tahminGuncellemeHakki = 0;
    u.minmatEkSure = 0;
    u.activeSecondsInPeriod = 0;
  });

  // Kazananlara SADECE yeni periyot için ödül (geçerlilik = yeni periodEnd)
  cupTop3.forEach((user, idx) => {
    applyCupmatPeriodReward(user, idx, newPeriodEnd);
  });
  minTop3.forEach((user, idx) => {
    applyMinmatPeriodReward(user, idx, newPeriodEnd);
    
    // Award prediction update rights to MinMat winners
    const predictionRightsBonus = [5, 3, 1];
    const rightsToAdd = predictionRightsBonus[idx] || 0;
    user.tahminGuncellemeHakki = (user.tahminGuncellemeHakki || 0) + rightsToAdd;
  });

  store.periodEnd = newPeriodEnd;
}

export async function checkAndResetPeriod(): Promise<void> {
  const store = await getStore();
  const now = new Date();
  const calculatedPeriodEnd = calculateCurrentPeriodEnd();
  const storePeriodEnd = new Date(store.periodEnd);

  if (now >= calculatedPeriodEnd || storePeriodEnd.getTime() !== calculatedPeriodEnd.getTime()) {
    await transitionToNextPeriodWithFixedSchedule(store, calculatedPeriodEnd);
    await saveStore(store);
  }
}

async function transitionToNextPeriodWithFixedSchedule(store: GamificationStore, newPeriodEnd: Date) {
  const endingPeriodEnd = new Date(newPeriodEnd.getTime() - PERIOD_DURATION_MS);
  const compareStart = getPeriodStart(endingPeriodEnd.toISOString());
  const predictions = await getLeaderboard();
  
  // Dönem sıfırlamasında minmat_leaderboard'da güncelleme yapmaya gerek yoktur (zaman damgası üzerinden hesaplanır)

  const periodChampions = [...store.userActivities]
    .filter((u) => u.mevcutPeriyotPuani > 0)
    .sort((a, b) => b.mevcutPeriyotPuani - a.mevcutPeriyotPuani)
    .slice(0, 3);

  periodChampions.forEach((user, index) => {
    store.gecmisSampiyonlar.push({
      userId: user.userId,
      displayName: user.displayName || `Kullanıcı-${user.userId.substring(0, 5)}`,
      derece: index + 1,
      periyotBitisTarihi: endingPeriodEnd.toISOString(),
    });
  });

  const cupTop3 = [...store.userActivities]
    .filter(isEmailEligible)
    .map((u) => ({
      user: u,
      combined: u.mevcutPeriyotPuani + (predictions.find((p) => p.userId === u.userId)?.points || 0) * 10,
    }))
    .sort((a, b) => b.combined - a.combined)
    .slice(0, 3)
    .map((row) => row.user);

  // MinMat ödül sıralaması (dönem içi en yüksek skor - in-memory e-posta/isim eşleştirmesi)
  const eligibleUsers = store.userActivities.filter(isEmailEligible);
  
  const { data: periodScoresList, error: scoresError } = await supabaseAdmin
    .from("minmat_leaderboard")
    .select("*")
    .gte("timestamp", compareStart.getTime());

  if (scoresError) {
    console.error("Error fetching minmat scores in transitionToNextPeriodWithFixedSchedule:", scoresError);
  }

  const minMatMaxByUserIdMap: Record<string, number> = {};
  const userIdToUserMap = new Map<string, any>();

  eligibleUsers.forEach(u => {
    userIdToUserMap.set(u.userId, u);
  });

  if (periodScoresList) {
    for (const s of periodScoresList) {
      const emailKey = s.email?.toLowerCase().trim() || "";
      const nameKey = s.name?.toLowerCase().trim() || "";

      const matchingUser = eligibleUsers.find((u) => 
        (emailKey && u.email?.toLowerCase().trim() === emailKey) || 
        (nameKey && u.displayName.toLowerCase().trim() === nameKey)
      );

      if (matchingUser) {
        const userId = matchingUser.userId;
        minMatMaxByUserIdMap[userId] = Math.max(minMatMaxByUserIdMap[userId] || 0, s.score || 0);
      }
    }
  }

  const minTop3 = Object.entries(minMatMaxByUserIdMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([userId]) => userIdToUserMap.get(userId))
    .filter((u): u is any => !!u);

  store.userActivities.forEach((u) => {
    clearPeriodRewardFields(u);
    u.mevcutPeriyotPuani = 0;
    u.tahminGuncellemeHakki = 0;
    u.minmatEkSure = 0;
    u.activeSecondsInPeriod = 0;
  });

  cupTop3.forEach((user, idx) => {
    applyCupmatPeriodReward(user, idx, newPeriodEnd.toISOString());
  });
  minTop3.forEach((user, idx) => {
    applyMinmatPeriodReward(user, idx, newPeriodEnd.toISOString());
    
    // Award prediction update rights to MinMat winners
    const predictionRightsBonus = [5, 3, 1];
    const rightsToAdd = predictionRightsBonus[idx] || 0;
    user.tahminGuncellemeHakki = (user.tahminGuncellemeHakki || 0) + rightsToAdd;
  });

  store.periodEnd = newPeriodEnd.toISOString();
}

// Retrieve or initialize user profile
export async function getOrCreateProfile(
  userId: string,
  displayName?: string,
  email?: string,
): Promise<ProfileWithPeriodRewards> {
  await checkAndResetPeriod();
  const store = await getStore();
  let profile = store.userActivities.find((u) => u.userId === userId);
  let needsSave = false;
  const todayStr = new Date().toISOString().split("T")[0];

  if (profile) {
    const now = new Date();
    if (profile.minmatBoostExpiresAt && now > new Date(profile.minmatBoostExpiresAt)) {
      if (
        (profile.minmatBoostTimeCharges || 0) > 0 ||
        (profile.minmatBoostLifeCharges || 0) > 0 ||
        (profile.minmatBoostScoreCharges || 0) > 0
      ) {
        profile.minmatBoostTimeCharges = 0;
        profile.minmatBoostLifeCharges = 0;
        profile.minmatBoostScoreCharges = 0;
        profile.minmatBoostExpiresAt = "";
        needsSave = true;
      }
    }
  }

  if (!profile) {
    profile = normalizeUserActivity({
      userId,
      displayName: displayName || `Oyuncu-${userId.substring(0, 5)}`,
      email: email,
      sonGirisTarihi: todayStr,
      gunlukGirisSayisi: 1,
    });
    // Award daily login points on profile creation
    profile.taraftarPuani += 10;
    profile.mevcutPeriyotPuani += 10;
    profile.minmatEkSure += 2;
    profile.lastClerkLoginAt = new Date().toISOString();
    
    store.userActivities.push(profile);
    needsSave = true;
  } else {
    let updated = false;
    if (displayName && profile.displayName !== displayName) {
      profile.displayName = displayName;
      updated = true;
    }
    if (email && profile.email !== email) {
      profile.email = email;
      updated = true;
    }
    
    // Check if calendar day has changed
    if (profile.sonGirisTarihi !== todayStr) {
      profile.sonGirisTarihi = todayStr;
      profile.gunlukGirisSayisi = 1;
      profile.yardimTiklandi = false;
      profile.hakkindaTiklandi = false;
      profile.minmatOyunSayisiBugun = 0;
      profile.pageStayClaimsTodayCount = 0;
      profile.pageStayHistory = {};

      // Award daily login points on first login of the day
      profile.taraftarPuani += 10;
      profile.mevcutPeriyotPuani += 10;
      profile.minmatEkSure += 2;
      profile.lastClerkLoginAt = new Date().toISOString();
      
      updated = true;
    }

    if (updated) {
      needsSave = true;
    }
  }

  if (expirePeriodRewardsIfNeeded(profile, store.periodEnd)) {
    needsSave = true;
  }

  if (needsSave) {
    await saveStore(store);
  }

  return enrichProfileWithPeriodRewardsFn(profile, store.periodEnd);
}

async function syncHistoricalMinMatLevels(store: GamificationStore): Promise<boolean> {
  let changed = false;
  try {
    const { data: scores, error } = await supabaseAdmin
      .from("minmat_leaderboard")
      .select("email, name, level, mode");

    if (error || !scores) {
      return false;
    }

    const maxLevelsByEmail: Record<string, Record<string, number>> = {};
    const maxLevelsByName: Record<string, Record<string, number>> = {};

    const normalizeMode = (m: string): "add" | "sub" | "mul" | "div" | "mix" => {
      const modeLower = m.toLowerCase().trim();
      if (modeLower === "add" || modeLower === "topla" || modeLower === "toplama") return "add";
      if (modeLower === "sub" || modeLower === "cikar" || modeLower === "çıkarma") return "sub";
      if (modeLower === "mul" || modeLower === "carp" || modeLower === "çarpma") return "mul";
      if (modeLower === "div" || modeLower === "bol" || modeLower === "bölme") return "div";
      if (modeLower === "mix" || modeLower === "karisik" || modeLower === "karışık") return "mix";
      return "mix";
    };

    for (const s of scores) {
      const modeKey = normalizeMode(s.mode);
      const lvl = Number(s.level) || 1;

      if (s.email) {
        const emailKey = s.email.toLowerCase().trim();
        if (!maxLevelsByEmail[emailKey]) {
          maxLevelsByEmail[emailKey] = { add: 1, sub: 1, mul: 1, div: 1, mix: 1 };
        }
        maxLevelsByEmail[emailKey][modeKey] = Math.max(maxLevelsByEmail[emailKey][modeKey], lvl);
      }

      if (s.name) {
        const nameKey = s.name.toLowerCase().trim();
        if (!maxLevelsByName[nameKey]) {
          maxLevelsByName[nameKey] = { add: 1, sub: 1, mul: 1, div: 1, mix: 1 };
        }
        maxLevelsByName[nameKey][modeKey] = Math.max(maxLevelsByName[nameKey][modeKey], lvl);
      }
    }

    for (const u of store.userActivities) {
      if (!u.minmatMaxLevels) {
        u.minmatMaxLevels = { add: 1, sub: 1, mul: 1, div: 1, mix: 1 };
      }

      const emailKey = u.email ? u.email.toLowerCase().trim() : "";
      const nameKey = u.displayName ? u.displayName.toLowerCase().trim() : "";

      const dbMaxLevelsEmail = emailKey ? maxLevelsByEmail[emailKey] : null;
      const dbMaxLevelsName = nameKey ? maxLevelsByName[nameKey] : null;

      const modes = ["add", "sub", "mul", "div", "mix"] as const;
      for (const mode of modes) {
        const dbValEmail = dbMaxLevelsEmail ? (dbMaxLevelsEmail[mode] || 1) : 1;
        const dbValName = dbMaxLevelsName ? (dbMaxLevelsName[mode] || 1) : 1;
        const dbVal = Math.max(dbValEmail, dbValName);

        const currentVal = u.minmatMaxLevels[mode] || 1;
        if (dbVal > currentVal) {
          u.minmatMaxLevels[mode] = dbVal;
          changed = true;
        }
      }
    }
  } catch (err) {
    console.error("Error syncing historical MinMat levels:", err);
  }
  return changed;
}

// Get sorted active leaderboard for current 3-day period
export async function getGamificationLeaderboard(): Promise<UserActivity[]> {
  await checkAndResetPeriod();
  const store = await getStore();
  
  // Sync historical MinMat levels from Supabase
  const storeChanged = await syncHistoricalMinMatLevels(store);
  if (storeChanged) {
    await saveStore(store);
  }

  const predictions = await getLeaderboard();

  const userNickMap = new Map<string, string>();
  try {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname");
    if (profiles) {
      profiles.forEach(p => {
        if (p.user_id && p.nickname) {
          userNickMap.set(p.user_id, p.nickname);
        }
      });
    }
  } catch (e) {
    console.error("Error fetching profiles for leaderboard names mapping:", e);
  }

  return store.userActivities
    .map((u) => {
      const predPoints = predictions.find((p) => p.userId === u.userId)?.points || 0;
      const periodBonus = getActiveCupmatGlobalBonus(u, store.periodEnd);
      const combinedPoints =
        u.mevcutPeriyotPuani + predPoints * 10 + periodBonus;
      const finalNick = userNickMap.get(u.userId) || u.displayName;
      return {
        ...u,
        displayName: finalNick,
        mevcutPeriyotPuani: combinedPoints,
      };
    })
    .sort((a, b) => b.mevcutPeriyotPuani - a.mevcutPeriyotPuani);
}

// Get the period end ISO string
export async function getPeriodEnd(): Promise<string> {
  const store = await getStore();
  return store.periodEnd;
}

// Get past champions
export async function getGecmisSampiyonlar(): Promise<GecmisSampiyon[]> {
  const store = await getStore();

  const userNickMap = new Map<string, string>();
  try {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname");
    if (profiles) {
      profiles.forEach(p => {
        if (p.user_id && p.nickname) {
          userNickMap.set(p.user_id, p.nickname);
        }
      });
    }
  } catch (e) {
    console.error("Error fetching profiles for past champions mapping:", e);
  }

  return store.gecmisSampiyonlar
    .filter((c) => c.derece >= 1 && c.derece <= ARCHIVE_PODIUM_LIMIT)
    .map((c) => {
      const finalNick = userNickMap.get(c.userId) || c.displayName;
      return {
        ...c,
        displayName: finalNick,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.periyotBitisTarihi).getTime() -
        new Date(a.periyotBitisTarihi).getTime(),
    );
}

// Reward leaderboard entry
export interface RewardEntry {
  displayName: string;
  score: number;
  rank: number;
  reward: string;
  level?: number;
  mode?: string;
}

export const REWARD_LEADERBOARD_LIMIT = 5;
export const ARCHIVE_PODIUM_LIMIT = 3;

// Get reward leaderboards for the current period (email-eligible users only)
export async function getRewardLeaderboards(): Promise<{
  cupMatRewards: RewardEntry[];
  minMatRewards: RewardEntry[];
}> {
  await checkAndResetPeriod();
  const store = await getStore();
  const predictions = await getLeaderboard();

  // Determine period start
  const compareStart = getPeriodStart(store.periodEnd);

  const eligible = store.userActivities.filter(isEmailEligible);

  const userNickMap = new Map<string, string>();
  try {
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname");
    if (profiles) {
      profiles.forEach(p => {
        if (p.user_id && p.nickname) {
          userNickMap.set(p.user_id, p.nickname);
        }
      });
    }
  } catch (e) {
    console.error("Error fetching profiles for reward leaderboards mapping:", e);
  }

  // CupMat reward table: ranked by combined period score
  const cupMatSorted = [...eligible]
    .map((u) => {
      const predPoints = predictions.find((p) => p.userId === u.userId)?.points || 0;
      const finalNick = userNickMap.get(u.userId) || u.displayName;
      return { ...u, displayName: finalNick, combinedScore: u.mevcutPeriyotPuani + predPoints * 10 };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  const cupMatRewardLabels = [
    "MinMat'ta her seviyede +10 saniye",
    "MinMat'ta her seviyede +5 puan",
    "MinMat'ta her seviyede +2 puan",
  ];

  const cupMatRewards: RewardEntry[] = cupMatSorted
    .slice(0, REWARD_LEADERBOARD_LIMIT)
    .map((u, i) => ({
      displayName: u.displayName,
      score: u.combinedScore,
      rank: i + 1,
      reward: i < 3 ? cupMatRewardLabels[i] : "",
    }));

  // MinMat reward table: ranked by maximum score in this period
  
  // Dönem başlangıcından bu yana olan minmat_leaderboard skorlarını çekelim
  const { data: minMatScores, error: scoresError } = await supabaseAdmin
    .from("minmat_leaderboard")
    .select("*")
    .gte("timestamp", compareStart.getTime());

  if (scoresError) {
    console.error("Error fetching minmat scores for reward calculation:", scoresError);
  }

  // Build max score map for eligible users (matched by email or displayName)
  const minMatMaxByUser: Record<
    string,
    { score: number; level: number; mode: string; displayName: string }
  > = {};

  // Kategori dönüşümü
  function mapCategoryDisplay(newCat: string) {
    const map: Record<string, string> = {
      "topla": "toplama",
      "cikar": "çıkarma",
      "carp": "çarpma",
      "bol": "bölme",
      "karisik": "karışık",
      "add": "toplama",
      "sub": "çıkarma",
      "mul": "çarpma",
      "div": "bölme",
      "mix": "karışık"
    };
    return map[newCat] || newCat;
  }

  if (minMatScores) {
    for (const s of minMatScores) {
      const emailKey = s.email?.toLowerCase().trim() || "";
      const nameKey = s.name?.toLowerCase().trim() || "";

      // Find if this score belongs to one of our eligible users
      const matchingUser = eligible.find((u) => 
        (emailKey && u.email?.toLowerCase().trim() === emailKey) || 
        (nameKey && u.displayName.toLowerCase().trim() === nameKey)
      );

      if (matchingUser) {
        const score = s.score || 0;
        const userKey = matchingUser.userId; // Use unique userId as grouping key
        const current = minMatMaxByUser[userKey];
        const finalNick = userNickMap.get(matchingUser.userId) || matchingUser.displayName;
        
        if (!current || score > current.score) {
          minMatMaxByUser[userKey] = {
            score,
            level: s.level || 1,
            mode: mapCategoryDisplay(s.mode),
            displayName: finalNick
          };
        }
      }
    }
  }

  const minMatSorted = Object.entries(minMatMaxByUser)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([, stats]) => [stats.displayName, stats] as const);

  const minMatRewardLabels = [
    "CupMat'ta +50 global puan ve 5 tahmin değiştirme hakkı",
    "CupMat'ta +30 global puan ve 3 tahmin değiştirme hakkı",
    "CupMat'ta +15 global puan ve 1 tahmin değiştirme hakkı",
  ];

  const minMatRewards: RewardEntry[] = minMatSorted
    .slice(0, REWARD_LEADERBOARD_LIMIT)
    .map(([name, stats], i) => ({
      displayName: name,
      score: stats.score,
      level: stats.level,
      mode: stats.mode,
      rank: i + 1,
      reward: i < 3 ? minMatRewardLabels[i] : "",
    }));

  return { cupMatRewards, minMatRewards };
}

// Process gamification action
export async function handleGamificationAction(
  userId: string,
  action: string,
  amount: number = 0,
  displayName?: string,
  email?: string
): Promise<{ success: boolean; profile: UserActivity; message: string }> {
  const profile = await getOrCreateProfile(userId, displayName, email);
  const todayStr = new Date().toISOString().split("T")[0];
  let message = "";

  // Dynamic Stay Page Scout Action Handler
  if (action.startsWith("stay_")) {
    // Safety check if day changed (already done in getOrCreateProfile, but double check)
    if (profile.sonGirisTarihi !== todayStr) {
      profile.sonGirisTarihi = todayStr;
      profile.pageStayClaimsTodayCount = 0;
      profile.yardimTiklandi = false;
      profile.hakkindaTiklandi = false;
      profile.minmatOyunSayisiBugun = 0;
      profile.pageStayHistory = {};
    }

    const now = Date.now();
    const cooldownMs = 2 * 60 * 60 * 1000; // 2 hours

    // Ensure history is initialized
    if (!profile.pageStayHistory) {
      profile.pageStayHistory = {};
    }

    // Get history for this specific page action
    const pageRecord = profile.pageStayHistory[action] || { lastClaimedAt: "", claimsTodayCount: 0 };

    // Check limit (max 5 claims per page per day)
    if ((pageRecord.claimsTodayCount || 0) >= 5) {
      return {
        success: false,
        profile,
        message: "Bu sayfa için günlük maksimum keşif sınırına (5) ulaştınız."
      };
    }

    // Check 2-hour cooldown for this specific page
    if (pageRecord.lastClaimedAt) {
      const lastClaimTime = new Date(pageRecord.lastClaimedAt).getTime();
      const elapsedMs = now - lastClaimTime;
      if (elapsedMs < cooldownMs) {
        const remainingMs = cooldownMs - elapsedMs;
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMinsText = remainingMinutes % 60;
        
        let cooldownStr = "";
        if (remainingHours > 0) {
          cooldownStr = `${remainingHours} saat ${remainingMinsText} dakika`;
        } else {
          cooldownStr = `${remainingMinutes} dakika`;
        }
        return {
          success: false,
          profile,
          message: `Bu sayfadan tekrar puan alabilmek için ${cooldownStr} beklemeniz gerekmektedir.`
        };
      }
    }

    // Allowed to claim points for this page!
    const added = amount || 1;
    profile.taraftarPuani += added;
    profile.mevcutPeriyotPuani += added;
    if (added >= 10) {
      profile.minmatEkSure += 2; // +2 seconds active Minmat time bonus
    }

    // Update history for this page
    profile.pageStayHistory[action] = {
      lastClaimedAt: new Date().toISOString(),
      claimsTodayCount: (pageRecord.claimsTodayCount || 0) + 1
    };

    profile.lastPageStayClaimAt = new Date().toISOString();
    message = `Keşif ödülü kazanıldı: +${added} Taraftar Puanı!`;

    const store = await getStore();
    const idx = store.userActivities.findIndex(u => u.userId === userId);
    if(idx >= 0) store.userActivities[idx] = profile;
    await saveStore(store);
    
    return { success: true, profile, message };
  }

  switch (action) {
    case "login": {
        if (profile.sonGirisTarihi !== todayStr) {
          profile.sonGirisTarihi = todayStr;
          profile.gunlukGirisSayisi = 1;
          profile.yardimTiklandi = false;
          profile.hakkindaTiklandi = false;
          profile.minmatOyunSayisiBugun = 0;
          profile.pageStayClaimsTodayCount = 0;

          profile.taraftarPuani += 10;
          profile.mevcutPeriyotPuani += 10;
          profile.minmatEkSure += 2; 
          profile.lastClerkLoginAt = new Date().toISOString();
          message = "Günlük giriş ödülü kazanıldı: +10 Taraftar Puanı, +2sn MinMat Süresi!";
        } else {
          profile.gunlukGirisSayisi += 1;
          message = "Günlük giriş sayacı güncellendi.";
        }
        break;
    }

    case "stay_30s": {
      const added = amount || 10;
      profile.taraftarPuani += added;
      profile.mevcutPeriyotPuani += added;
      profile.minmatEkSure += 2; 
      message = `Aktif katılım ödülü kazanıldı: +${added} Taraftar Puanı, +2sn MinMat Süresi!`;
      break;
    }

    case "player_scout": {
      const added = amount || 3;
      profile.taraftarPuani += added;
      profile.mevcutPeriyotPuani += added;
      message = `Futbolcu keşif ödülü kazanıldı: +${added} Puan!`;
      break;
    }

    case "help_clicked": {
      if (!profile.yardimTiklandi) {
        profile.yardimTiklandi = true;
        profile.taraftarPuani += 5;
        profile.mevcutPeriyotPuani += 5;
        message = "Yardım inceleme ödülü: +5 Puan!";
      } else {
        message = "Bugün zaten yardım incelenmiş.";
      }
      break;
    }

    case "about_clicked": {
      if (!profile.hakkindaTiklandi) {
        profile.hakkindaTiklandi = true;
        profile.taraftarPuani += 5;
        profile.mevcutPeriyotPuani += 5;
        message = "Hakkında inceleme ödülü: +5 Puan!";
      } else {
        message = "Bugün zaten hakkında incelenmiş.";
      }
      break;
    }

    case "earn_minmat_time": {
      const added = amount || 10;
      profile.minmatEkSure += added;
      message = `MinMat ek süresi kazanıldı: +${added} saniye!`;
      break;
    }

    case "earn_prediction_right": {
      const added = amount || 1;
      profile.tahminGuncellemeHakki += added;
      message = `CupMat tahmin değiştirme hakkı kazanıldı: +${added} hak!`;
      break;
    }

    case "use_minmat_time": {
      const needed = amount || 5;
      if (profile.minmatEkSure >= needed) {
        profile.minmatEkSure -= needed;
        message = `${needed} saniye MinMat ek süresi kullanıldı.`;
      } else {
        return { success: false, profile, message: "Yetersiz ek süre bakiyesi." };
      }
      break;
    }

    case "use_prediction_right": {
      if (profile.tahminGuncellemeHakki > 0) {
        profile.tahminGuncellemeHakki -= 1;
        message = "1 adet tahmin değiştirme hakkı kullanıldı.";
      } else {
        return { success: false, profile, message: "Yetersiz tahmin değiştirme hakkı." };
      }
      break;
    }

    case "poll_answered": {
      const added = amount || 10;
      profile.taraftarPuani += added;
      profile.mevcutPeriyotPuani += added;
      message = `Anket/Soru cevaplama ödülü: +${added} Taraftar Puanı!`;
      break;
    }

    default:
      return { success: false, profile, message: "Bilinmeyen eylem tipi." };
  }

  const store = await getStore();
  const idx = store.userActivities.findIndex(u => u.userId === userId);
  if(idx >= 0) store.userActivities[idx] = profile;
  await saveStore(store);

  return { success: true, profile, message };
}

/** Admin: periyodu hemen bitir, ödülleri sonraki periyoda tanımla, eski ödülleri temizle */
export async function forceResetPeriod(): Promise<void> {
  const store = await getStore();
  await transitionToNextPeriod(store);
  await saveStore(store);
}

// Award a prediction update key to a user by their display name (case-insensitive)
export async function awardPredictionRightByName(displayName: string, amount: number = 1): Promise<{ success: boolean; message: string }> {
  const store = await getStore();
  const profile = store.userActivities.find(
    (u) => u.displayName.trim().toLowerCase() === displayName.trim().toLowerCase()
  );
  if (!profile) {
    return { success: false, message: "Kullanıcı bulunamadı." };
  }
  profile.tahminGuncellemeHakki += amount;
  await saveStore(store);
  return { success: true, message: `${amount} adet tahmin değiştirme hakkı başarıyla eklendi.` };
}

// Find a user activity profile by display name (case-insensitive)
export async function getProfileByDisplayName(
  displayName: string,
): Promise<ProfileWithPeriodRewards | null> {
  await checkAndResetPeriod();
  const store = await getStore();
  const profile = store.userActivities.find(
    (u) =>
      u.displayName.trim().toLowerCase() === displayName.trim().toLowerCase(),
  );
  if (!profile) return null;

  if (expirePeriodRewardsIfNeeded(profile, store.periodEnd)) {
    await saveStore(store);
  }

  return enrichProfileWithPeriodRewardsFn(profile, store.periodEnd);
}

function incrementMinMatDailyCount(profile: UserActivity): void {
  const todayStr = new Date().toISOString().split("T")[0];
  if (profile.sonGirisTarihi !== todayStr) {
    profile.sonGirisTarihi = todayStr;
    profile.minmatOyunSayisiBugun = 0;
  }
  profile.minmatOyunSayisiBugun = (profile.minmatOyunSayisiBugun || 0) + 1;
}

// Increment today's MinMat game count by display name (legacy lookup)
export async function registerMinMatGamePlayed(displayName: string): Promise<{ success: boolean; profile?: UserActivity }> {
  const store = await getStore();
  const profile = store.userActivities.find(
    (u) => u.displayName.trim().toLowerCase() === displayName.trim().toLowerCase()
  );
  if (!profile) {
    return { success: false };
  }

  incrementMinMatDailyCount(profile);
  await saveStore(store);
  return { success: true, profile };
}

// Increment today's MinMat game count for the signed-in Clerk user
export async function registerMinMatGamePlayedByUserId(
  userId: string,
  displayName?: string,
  email?: string,
): Promise<{ success: boolean; profile?: UserActivity }> {
  const profile = await getOrCreateProfile(userId, displayName, email);
  const store = await getStore();
  incrementMinMatDailyCount(profile);
  const idx = store.userActivities.findIndex((u) => u.userId === userId);
  if (idx >= 0) {
    store.userActivities[idx] = profile;
  }
  await saveStore(store);
  return { success: true, profile };
}

// Increment today's and all-time MinMat game count by category/mode for the signed-in Clerk user
export async function incrementMinMatGamesPlayedCount(
  userId: string,
  mode: string,
  displayName?: string,
  email?: string,
): Promise<{ success: boolean; profile: UserActivity }> {
  const profile = await getOrCreateProfile(userId, displayName, email);
  if (!profile.minmatGamesPlayedCount) {
    profile.minmatGamesPlayedCount = { add: 0, sub: 0, mul: 0, div: 0, mix: 0 };
  }
  
  function normalizeMinmatMode(rawMode: string): "add" | "sub" | "mul" | "div" | "mix" {
    const map: Record<string, "add" | "sub" | "mul" | "div" | "mix"> = {
      "topla": "add",
      "cikar": "sub",
      "carp": "mul",
      "bol": "div",
      "karisik": "mix",
      "add": "add",
      "sub": "sub",
      "mul": "mul",
      "div": "div",
      "mix": "mix"
    };
    return map[rawMode] || "mix";
  }

  const normMode = normalizeMinmatMode(mode);
  profile.minmatGamesPlayedCount[normMode] = (profile.minmatGamesPlayedCount[normMode] || 0) + 1;
  
  // also increment daily count
  incrementMinMatDailyCount(profile);

  const store = await getStore();
  const idx = store.userActivities.findIndex((u) => u.userId === userId);
  if (idx >= 0) {
    store.userActivities[idx] = profile;
  }
  await saveStore(store);
  return { success: true, profile };
}