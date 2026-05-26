import { NextResponse } from "next/server";
import { getStore, saveStore } from "@/lib/store/gamification-store";
import { supabaseAdmin } from "@/lib/supabase";

const CRON_SECRET = process.env.CRON_SECRET || "";

// Sabit başlangıç zamanı: 25 Mayıs 2026 Pazartesi 00:00:00 UTC
const FIXED_PERIOD_START = new Date(Date.UTC(2026, 4, 25, 0, 0, 0, 0)); // Ay 0-indexli (Mayıs = 4)
const PERIOD_DURATION_MS = 72 * 60 * 60 * 1000; // 72 saat = 3 gün

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");

    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    if (force) {
      await forceResetPeriodWithFixedSchedule();
      return NextResponse.json({
        success: true,
        message: "Periyot sabit zaman çizelgesine göre zorla sıfırlandı!",
      });
    }

    await checkAndResetPeriodWithFixedSchedule();

    return NextResponse.json({
      success: true,
      message: "Periyot kontrolü tamamlandı (sabit zaman çizelgesi)",
    });
  } catch (error) {
    console.error("Cron period reset hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

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

/**
 * Sabit zaman çizelgesine göre periyodu kontrol eder ve gerekiyorsa sıfırlar
 */
async function checkAndResetPeriodWithFixedSchedule() {
  const store = await getStore();
  const now = new Date();
  const calculatedPeriodEnd = calculateCurrentPeriodEnd();
  const previousPeriodEnd = new Date(calculatedPeriodEnd.getTime() - PERIOD_DURATION_MS);

  const storePeriodEnd = new Date(store.periodEnd);

  if (now >= calculatedPeriodEnd || storePeriodEnd.getTime() !== calculatedPeriodEnd.getTime()) {
    await transitionToNextPeriodWithFixedSchedule(store, calculatedPeriodEnd, previousPeriodEnd);
    await saveStore(store);
  }
}

/**
 * Sabit zaman çizelgesine göre periyot geçişini gerçekleştirir
 */
async function transitionToNextPeriodWithFixedSchedule(
  store: any, 
  newPeriodEnd: Date, 
  endingPeriodEnd: Date
) {
  const { getPeriodStart, parseTrDate, applyCupmatPeriodReward, applyMinmatPeriodReward, clearPeriodRewardFields } = await import("@/lib/gamification/period-rewards");
  const { getLeaderboard } = await import("@/lib/store/leaderboard-store");
  
  const compareStart = getPeriodStart(endingPeriodEnd.toISOString());
  const predictions = await getLeaderboard();

  function isEmailEligible(user: any): boolean {
    return user.userId.startsWith("user_");
  }

  const periodChampions = [...store.userActivities]
    .filter((u: any) => u.mevcutPeriyotPuani > 0)
    .sort((a: any, b: any) => b.mevcutPeriyotPuani - a.mevcutPeriyotPuani)
    .slice(0, 3);

  periodChampions.forEach((user: any, index: number) => {
    store.gecmisSampiyonlar.push({
      userId: user.userId,
      displayName: user.displayName || `Kullanıcı-${user.userId.substring(0, 5)}`,
      derece: index + 1,
      periyotBitisTarihi: endingPeriodEnd.toISOString(),
    });
  });

  const cupTop3 = [...store.userActivities]
    .filter(isEmailEligible)
    .map((u: any) => ({
      user: u,
      combined: u.mevcutPeriyotPuani + (predictions.find((p: any) => p.userId === u.userId)?.points || 0) * 10,
    }))
    .sort((a: any, b: any) => b.combined - a.combined)
    .slice(0, 3)
    .map((row: any) => row.user);

  const { getMinMatLeaderboard } = await import("@/lib/store/minmat-leaderboard-store");
  const minMatScores = await getMinMatLeaderboard();
  const periodScores = minMatScores.filter(
    (s: any) => parseTrDate(s.date) >= compareStart,
  );
  const eligibleNames = new Set(
    store.userActivities.filter(isEmailEligible).map((u: any) => u.displayName),
  );
  const minMatMaxByName: Record<string, number> = {};
  for (const s of periodScores) {
    if (eligibleNames.has(s.name)) {
      minMatMaxByName[s.name] = Math.max(minMatMaxByName[s.name] || 0, s.score);
    }
  }
  const minTop3 = Object.entries(minMatMaxByName)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => store.userActivities.find((u: any) => u.displayName === name))
    .filter((u: any): u is any => !!u);

  store.userActivities.forEach((u: any) => {
    clearPeriodRewardFields(u);
    u.mevcutPeriyotPuani = 0;
    u.tahminGuncellemeHakki = 0;
    u.minmatEkSure = 0;
    u.activeSecondsInPeriod = 0;
  });

  cupTop3.forEach((user: any, idx: number) => {
    applyCupmatPeriodReward(user, idx, newPeriodEnd.toISOString());
  });
  minTop3.forEach((user: any, idx: number) => {
    applyMinmatPeriodReward(user, idx, newPeriodEnd.toISOString());
  });

  store.periodEnd = newPeriodEnd.toISOString();

  await resetMinMatRewardScores();
}

async function forceResetPeriodWithFixedSchedule() {
  const store = await getStore();
  const calculatedPeriodEnd = calculateCurrentPeriodEnd();
  await transitionToNextPeriodWithFixedSchedule(store, calculatedPeriodEnd, new Date(calculatedPeriodEnd.getTime() - PERIOD_DURATION_MS));
  await saveStore(store);
}

async function resetMinMatRewardScores() {
  try {
    const { error } = await supabaseAdmin
      .from("minmat_leaderboard")
      .update({ reward_score: 0 });

    if (error) {
      console.error("MinMat reward_score sıfırlama hatası:", error);
    } else {
      console.log("MinMat reward_score'leri başarıyla sıfırlandı!");
    }
  } catch (error) {
    console.error("MinMat reward_score sıfırlama hatası:", error);
  }
}
