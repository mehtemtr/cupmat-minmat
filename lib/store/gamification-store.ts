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

// Persist in serverless global state
const globalStore = globalThis as unknown as {
  gamification?: GamificationStore;
};

function getStore(): GamificationStore {
  if (!globalStore.gamification) {
    const defaultPeriodEnd = new Date();
    defaultPeriodEnd.setHours(0, 0, 0, 0);
    defaultPeriodEnd.setDate(defaultPeriodEnd.getDate() + 3);

    globalStore.gamification = {
      userActivities: [
        {
          userId: "demo-1",
          displayName: "Kara",
          taraftarPuani: 123,
          gunlukGirisSayisi: 1,
          sonGirisTarihi: new Date().toISOString().split("T")[0],
          minmatEkSure: 10,
          tahminGuncellemeHakki: 2,
          yardimTiklandi: true,
          hakkindaTiklandi: false,
          mevcutPeriyotPuani: 123,
          genelTahminHakkiKullanildi: false,
          minmatOyunSayisiBugun: 6,
        },
        {
          userId: "demo-2",
          displayName: "Kartal",
          taraftarPuani: 81,
          gunlukGirisSayisi: 2,
          sonGirisTarihi: new Date().toISOString().split("T")[0],
          minmatEkSure: 5,
          tahminGuncellemeHakki: 1,
          yardimTiklandi: false,
          hakkindaTiklandi: true,
          mevcutPeriyotPuani: 81,
          genelTahminHakkiKullanildi: false,
          minmatOyunSayisiBugun: 3,
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
  return globalStore.gamification!;
}

// Automatically check and reset the 3-day periyot if current time has passed periodEnd
export function checkAndResetPeriod(): void {
  const store = getStore();
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

    // 3. Reset mevcutPeriyotPuani, tahminGuncellemeHakki and minmatEkSure for ALL users
    store.userActivities.forEach((u) => {
      u.mevcutPeriyotPuani = 0;
      u.tahminGuncellemeHakki = 0;
      u.minmatEkSure = 0;
    });

    // 4. Schedule the next 3-day reset period
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + 3);
    store.periodEnd = newEnd.toISOString();
  }
}

// Retrieve or initialize user profile
export function getOrCreateProfile(userId: string, displayName?: string): UserActivity {
  checkAndResetPeriod();
  const store = getStore();
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
    };
    store.userActivities.push(profile);
  } else if (displayName && profile.displayName !== displayName) {
    profile.displayName = displayName; // Keep display name synchronized
  }

  return profile;
}

// Get sorted active leaderboard for current 3-day period
export function getGamificationLeaderboard(): UserActivity[] {
  checkAndResetPeriod();
  const store = getStore();
  const predictions = getLeaderboard();

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
export function getPeriodEnd(): string {
  const store = getStore();
  return store.periodEnd;
}

// Get past champions
export function getGecmisSampiyonlar(): GecmisSampiyon[] {
  const store = getStore();
  return store.gecmisSampiyonlar;
}

// Process gamification action
export function handleGamificationAction(
  userId: string,
  action: string,
  amount: number = 0,
  displayName?: string
): { success: boolean; profile: UserActivity; message: string } {
  const profile = getOrCreateProfile(userId, displayName);
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
    return { success: true, profile, message };
  }

  switch (action) {
    case "login": {
      if (profile.sonGirisTarihi !== todayStr) {
        // Daily Login Streak Check
        profile.sonGirisTarihi = todayStr;
        profile.gunlukGirisSayisi = 1;
        profile.yardimTiklandi = false;
        profile.hakkindaTiklandi = false;
        profile.minmatOyunSayisiBugun = 0;

        profile.taraftarPuani += 10;
        profile.mevcutPeriyotPuani += 10;
        profile.minmatEkSure += 2; // +2 seconds daily reward
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

  return { success: true, profile, message };
}

// Reset period manually (for testing / triggers)
export function forceResetPeriod(): void {
  const store = getStore();
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
    u.mevcutPeriyotPuani = 0;
    u.tahminGuncellemeHakki = 0;
    u.minmatEkSure = 0;
  });

  const newEnd = new Date();
  newEnd.setDate(newEnd.getDate() + 3);
  store.periodEnd = newEnd.toISOString();
}

// Award a prediction update key to a user by their display name (case-insensitive)
export function awardPredictionRightByName(displayName: string, amount: number = 1): { success: boolean; message: string } {
  const store = getStore();
  const profile = store.userActivities.find(
    (u) => u.displayName.trim().toLowerCase() === displayName.trim().toLowerCase()
  );
  if (!profile) {
    return { success: false, message: "Kullanıcı bulunamadı." };
  }
  profile.tahminGuncellemeHakki += amount;
  return { success: true, message: `${amount} adet tahmin değiştirme hakkı başarıyla eklendi.` };
}

// Find a user activity profile by display name (case-insensitive)
export function getProfileByDisplayName(displayName: string): UserActivity | null {
  const store = getStore();
  return store.userActivities.find(
    (u) => u.displayName.trim().toLowerCase() === displayName.trim().toLowerCase()
  ) || null;
}

// Increment the today's game count when MinMat is played
export function registerMinMatGamePlayed(displayName: string): { success: boolean; profile?: UserActivity } {
  const store = getStore();
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
  return { success: true, profile };
}
