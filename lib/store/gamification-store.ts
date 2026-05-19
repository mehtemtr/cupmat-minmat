import { kv } from "@vercel/kv";
import { getLeaderboard } from "@/lib/store/leaderboard-store";

export interface UserActivity {
  userId: string;
  displayName: string;
  taraftarPuani: number;          // Cupmat activity points
  gunlukGirisSayisi: number;       // Logins within the current day
  sonGirisTarihi: string;          // Last login date (YYYY-MM-DD)
  minmatEkSure: number;            // Extra seconds for Minmat (+10, +5, +2)
  tahminGuncellemeHakki: number;   // Cupmat prediction change rights
  yardimTiklandi: boolean;         // Daily help clicked check
  hakkindaTiklandi: boolean;       // Daily about clicked check
  mevcutPeriyotPuani: number;      // Current 3-day period score
  genelTahminHakkiKullanildi: boolean; // 1-time free initial predictions used
  minmatOyunSayisiBugun: number;   // Number of Minmat games played today
  lastClerkLoginAt: string | null;  // Last Clerk email login timestamp
  activeSecondsInPeriod: number;    // Seconds tracked in the current period
  cupMatRewardSeconds: number;      // Bonus seconds per Minmat level from CupMat rank
  cupMatRewardPoints: number;       // Bonus points per Minmat level from CupMat rank
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

const KV_KEY = "gamification_store";

async function getStore(): Promise<GamificationStore> {
  try {
    const data = await kv.get<GamificationStore>(KV_KEY);
    if (data) return data;
  } catch (error) {
    console.error("KV Error loading gamification store", error);
  }

  const defaultPeriodEnd = new Date();
  defaultPeriodEnd.setMilliseconds(defaultPeriodEnd.getMilliseconds() + (2 * 24 + 11) * 60 * 60 * 1000);

  return {
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
        cupMatRewardSeconds: 0,
        cupMatRewardPoints: 0,
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
        cupMatRewardSeconds: 0,
        cupMatRewardPoints: 0,
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
}

async function saveStore(store: GamificationStore): Promise<void> {
  try {
    await kv.set(KV_KEY, store);
  } catch (error) {
    console.error("KV Error saving gamification store", error);
  }
}

// Automatically check and reset the 3-day periyot if current time has passed periodEnd
export async function checkAndResetPeriod(): Promise<void> {
  const store = await getStore();
  const now = new Date();
  const periodEndDate = new Date(store.periodEnd);

  if (now >= periodEndDate) {
    // 1. Sort active users by their period score
    const topUsers = [...store.userActivities]
      .filter((u) => u.mevcutPeriyotPuani > 0)
      .sort((a, b) => b.mevcutPeriyotPuani - a.mevcutPeriyotPuani)
      .slice(0, 3);

    // 2. Archive the top 3 in GecmisSampiyonlar
    topUsers.forEach((user, index) => {
      store.gecmisSampiyonlar.push({
        userId: user.userId,
        displayName: user.displayName || `Kullanıcı-${user.userId.substring(0, 5)}`,
        derece: index + 1,
        periyotBitisTarihi: store.periodEnd,
      });
    });

    // Email-login eligibility for this period
    const periodStart = new Date(store.periodEnd);
    periodStart.setDate(periodStart.getDate() - 3);
    const compareStart = new Date(periodStart);
    compareStart.setHours(0, 0, 0, 0); // Normalize to midnight to include start day

    const emailEligible = (u: UserActivity) => {
      return u.userId.startsWith("user_");
    };

    // 3. Apply CupMat -> MinMat bonuses (seconds/points per level)
    const cupTop = [...store.userActivities]
      .filter(emailEligible)
      .sort((a, b) => b.taraftarPuani - a.taraftarPuani)
      .slice(0, 3);
    if (cupTop[0]) cupTop[0].cupMatRewardSeconds += 10; // +10 sec per level
    if (cupTop[1]) cupTop[1].cupMatRewardPoints += 5;   // +5 pt per level
    if (cupTop[2]) cupTop[2].cupMatRewardPoints += 2;   // +2 pt per level

    // 4. Apply MinMat -> CupMat global point bonuses
    const { getMinMatLeaderboard } = await import("@/lib/store/minmat-leaderboard-store");
    const minMatScores = await getMinMatLeaderboard();

    // Helper to parse dates in DD.MM.YYYY or ISO format
    const parseTrDate = (dateStr: string): Date => {
      if (!dateStr) return new Date(0);
      if (dateStr.includes("-")) return new Date(dateStr);
      const parts = dateStr.split(".");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date(0) : d;
    };

    // Filter scores within the current period
    const periodScores = minMatScores.filter(s => {
      const scoreDate = parseTrDate(s.date);
      return scoreDate >= compareStart;
    });

    // Get max score per eligible user
    const minMatMaxScores: Record<string, number> = {};
    const eligibleNames = new Set(store.userActivities.filter(emailEligible).map(u => u.displayName));
    
    for (const s of periodScores) {
      if (eligibleNames.has(s.name)) {
        minMatMaxScores[s.name] = Math.max(minMatMaxScores[s.name] || 0, s.score);
      }
    }

    // Sort users by their max score
    const minTopNames = Object.entries(minMatMaxScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name]) => name);

    const minRewards = [50, 30, 15];
    minTopNames.forEach((name, idx) => {
      const u = store.userActivities.find(act => act.displayName === name);
      if (u) {
        u.taraftarPuani += minRewards[idx];
      }
    });

    // 5. Reset logic, keeping demo users at their hard-coded scores
    store.userActivities.forEach((u) => {
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
      u.cupMatRewardSeconds = 0;
      u.cupMatRewardPoints = 0;
    });

    // 6. Schedule the next 3-day reset period
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + 3);
    store.periodEnd = newEnd.toISOString();
    
    await saveStore(store);
  }
}

// Retrieve or initialize user profile
export async function getOrCreateProfile(userId: string, displayName?: string): Promise<UserActivity> {
  await checkAndResetPeriod();
  const store = await getStore();
  let profile = store.userActivities.find((u) => u.userId === userId);

  if (!profile) {
    profile = {
      userId,
      displayName: displayName || `Oyuncu-${userId.substring(0, 5)}`,
      taraftarPuani: 0,
      gunlukGirisSayisi: 0,
      sonGirisTarihi: "",
      minmatEkSure: 0,
      tahminGuncellemeHakki: 0,
      yardimTiklandi: false,
      hakkindaTiklandi: false,
      mevcutPeriyotPuani: 0,
      genelTahminHakkiKullanildi: false,
      minmatOyunSayisiBugun: 0,
      lastClerkLoginAt: null,
      activeSecondsInPeriod: 0,
      cupMatRewardSeconds: 0,
      cupMatRewardPoints: 0,
    };
    store.userActivities.push(profile);
    await saveStore(store);
  } else if (displayName && profile.displayName !== displayName) {
    profile.displayName = displayName; // Keep display name synchronized
    await saveStore(store);
  }

  return profile;
}

// Get sorted active leaderboard for current 3-day period
export async function getGamificationLeaderboard(): Promise<UserActivity[]> {
  await checkAndResetPeriod();
  const store = await getStore();
  const predictions = await getLeaderboard();

  return store.userActivities
    .map((u) => {
      const predPoints = predictions.find((p) => p.userId === u.userId)?.points || 0;
      const combinedPoints = u.mevcutPeriyotPuani + predPoints * 10;
      return {
        ...u,
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
  return store.gecmisSampiyonlar;
}

// Reward leaderboard entry
export interface RewardEntry {
  displayName: string;
  score: number;
  rank: number;
  reward: string; // human-readable reward description
}

// Get reward leaderboards for the current period (email-eligible users only)
export async function getRewardLeaderboards(): Promise<{
  cupMatRewards: RewardEntry[];
  minMatRewards: RewardEntry[];
}> {
  await checkAndResetPeriod();
  const store = await getStore();
  const predictions = await getLeaderboard();

  // Determine period start
  const periodStart = new Date(store.periodEnd);
  periodStart.setDate(periodStart.getDate() - 3);
  const compareStart = new Date(periodStart);
  compareStart.setHours(0, 0, 0, 0); // Normalize to midnight to include start day

  // Eligibility: any Clerk user (email logged-in user)
  const eligible = store.userActivities.filter((u) => {
    return u.userId.startsWith("user_");
  });

  // CupMat reward table: ranked by combined period score (same as main leaderboard)
  const cupMatSorted = [...eligible]
    .map((u) => {
      const predPoints = predictions.find((p) => p.userId === u.userId)?.points || 0;
      return { ...u, combinedScore: u.mevcutPeriyotPuani + predPoints * 10 };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  const cupMatRewardLabels = [
    "MinMat'ta her seviyede +10 saniye",
    "MinMat'ta her seviyede +5 puan",
    "MinMat'ta her seviyede +2 puan",
  ];

  const cupMatRewards: RewardEntry[] = cupMatSorted.map((u, i) => ({
    displayName: u.displayName,
    score: u.combinedScore,
    rank: i + 1,
    reward: i < 3 ? cupMatRewardLabels[i] : "",
  }));

  // MinMat reward table: ranked by maximum score in this period
  const { getMinMatLeaderboard } = await import("@/lib/store/minmat-leaderboard-store");
  const minMatScores = await getMinMatLeaderboard();

  // Helper to parse dates in DD.MM.YYYY or ISO format
  const parseTrDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes("-")) return new Date(dateStr);
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  // Filter scores within the current period
  const periodScores = minMatScores.filter(s => {
    const scoreDate = parseTrDate(s.date);
    return scoreDate >= compareStart;
  });

  // Build max score map for eligible users
  const eligibleNames = new Set(eligible.map((u) => u.displayName));
  const minMatMaxScores: Record<string, number> = {};
  for (const s of periodScores) {
    if (eligibleNames.has(s.name)) {
      minMatMaxScores[s.name] = Math.max(minMatMaxScores[s.name] || 0, s.score);
    }
  }

  const minMatSorted = Object.entries(minMatMaxScores)
    .sort(([, a], [, b]) => b - a);

  const minMatRewardLabels = [
    "CupMat'ta +50 global puan",
    "CupMat'ta +30 global puan",
    "CupMat'ta +15 global puan",
  ];

  const minMatRewards: RewardEntry[] = minMatSorted.map(([name, score], i) => ({
    displayName: name,
    score,
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
  displayName?: string
): Promise<{ success: boolean; profile: UserActivity; message: string }> {
  const profile = await getOrCreateProfile(userId, displayName);
  const todayStr = new Date().toISOString().split("T")[0];
  let message = "";

  // Dynamic Stay Page Scout Action Handler
  if (action.startsWith("stay_")) {
    const added = amount || 1;
    profile.taraftarPuani += added;
    profile.mevcutPeriyotPuani += added;
    if (added >= 10) {
      profile.minmatEkSure += 2; // +2 seconds active Minmat time bonus
    }
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

          profile.taraftarPuani += 10;
          profile.mevcutPeriyotPuani += 10;
          profile.minmatEkSure += 2; // +2 seconds daily reward
          // Record email login timestamp
          profile.lastClerkLoginAt = new Date().toISOString();
          message = "Günlük giriş ödülü kazanıldı: +10 Taraftar Puanı, +2sn MinMat Süresi!";
        } else {
          profile.gunlukGirisSayisi += 1;
          // If already logged in via email earlier, keep timestamp unchanged
          message = "Günlük giriş sayacı güncellendi.";
        }
        break;
    }

    case "stay_30s": {
      const added = amount || 10;
      profile.taraftarPuani += added;
      profile.mevcutPeriyotPuani += added;
      profile.minmatEkSure += 2; // +2 seconds active reward
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

    default:
      return { success: false, profile, message: "Bilinmeyen eylem tipi." };
  }

  const store = await getStore();
  const idx = store.userActivities.findIndex(u => u.userId === userId);
  if(idx >= 0) store.userActivities[idx] = profile;
  await saveStore(store);

  return { success: true, profile, message };
}

// Reset period manually (for testing / triggers)
export async function forceResetPeriod(): Promise<void> {
  const store = await getStore();
  const topUsers = [...store.userActivities]
    .filter((u) => u.mevcutPeriyotPuani > 0)
    .sort((a, b) => b.mevcutPeriyotPuani - a.mevcutPeriyotPuani)
    .slice(0, 3);

  topUsers.forEach((user, index) => {
    store.gecmisSampiyonlar.push({
      userId: user.userId,
      displayName: user.displayName || `Kullanıcı-${user.userId.substring(0, 5)}`,
      derece: index + 1,
      periyotBitisTarihi: store.periodEnd,
    });
  });

  store.userActivities.forEach((u) => {
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
  });

  const newEnd = new Date();
  newEnd.setDate(newEnd.getDate() + 3);
  store.periodEnd = newEnd.toISOString();
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
export async function getProfileByDisplayName(displayName: string): Promise<UserActivity | null> {
  const store = await getStore();
  return store.userActivities.find(
    (u) => u.displayName.trim().toLowerCase() === displayName.trim().toLowerCase()
  ) || null;
}

// Increment the today's game count when MinMat is played
export async function registerMinMatGamePlayed(displayName: string): Promise<{ success: boolean; profile?: UserActivity }> {
  const store = await getStore();
  const profile = store.userActivities.find(
    (u) => u.displayName.trim().toLowerCase() === displayName.trim().toLowerCase()
  );
  if (!profile) {
    return { success: false };
  }
  
  const todayStr = new Date().toISOString().split("T")[0];
  if (profile.sonGirisTarihi !== todayStr) {
    profile.sonGirisTarihi = todayStr;
    profile.minmatOyunSayisiBugun = 0;
  }
  
  profile.minmatOyunSayisiBugun = (profile.minmatOyunSayisiBugun || 0) + 1;
  await saveStore(store);
  return { success: true, profile };
}
