import { NextResponse } from "next/server";
import {
  requireApiAuth,
  verifyAdminSecret,
  isBlockedGamificationAction,
  isAllowedGamificationAction,
} from "@/lib/auth/api-auth";
import {
  getOrCreateProfile,
  getGamificationLeaderboard,
  getGecmisSampiyonlar,
  getPeriodEnd,
  handleGamificationAction,
  forceResetPeriod,
  getProfileByDisplayName,
  getRewardLeaderboards,
} from "@/lib/store/gamification-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const displayName = searchParams.get("displayName") || undefined;

    let profile = null;

    if (requestedUserId) {
      const authResult = await requireApiAuth();
      if (!authResult.ok) {
        return authResult.response;
      }
      if (authResult.userId !== requestedUserId) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
      }
      profile = await getOrCreateProfile(authResult.userId, authResult.displayName);
    } else if (displayName) {
      profile = await getProfileByDisplayName(displayName);
    }

    const leaderboard = await getGamificationLeaderboard();
    const gecmisSampiyonlar = await getGecmisSampiyonlar();
    const periodEnd = await getPeriodEnd();
    const { cupMatRewards, minMatRewards } = await getRewardLeaderboards();
    const { supabaseAdmin } = await import("@/lib/supabase");
    
    const seventyTwoHoursAgo = Date.now() - 72 * 60 * 60 * 1000;

    // CupMat Podium (Supabase'ten)
    const { data: cupData, error: cupError } = await supabaseAdmin
      .from("cupmat_leaderboard")
      .select("*")
      .order("points", { ascending: false })
      .limit(3);

    const cupMatPodium72h = (!cupError && cupData) 
      ? cupData.map((entry, index) => ({
          ...entry,
          rank: index + 1,
          displayName: entry.display_name,
        }))
      : [];

    // MinMat Podium (Supabase'ten)
    // 1. Önce son 72 saatteki verileri çek
    const { data: minData, error: minError } = await supabaseAdmin
      .from("minmat_leaderboard")
      .select("*")
      .gte("timestamp", seventyTwoHoursAgo)
      .not("email", "is", null);

    let minPodiumData = minData || [];

    // 2. Eğer son 72 saatte veri yoksa, tüm zamanların en yüksek skorlarını çek (fallback)
    if (minPodiumData.length === 0 && !minError) {
      console.log("Gamification: MinMat son 72 saatte veri yok, tüm zamanların en yüksek skorları çekiliyor...");
      const { data: allTimeMinData, error: allTimeMinError } = await supabaseAdmin
        .from("minmat_leaderboard")
        .select("*")
        .not("email", "is", null)
        .order("score", { ascending: false })
        .limit(100);

      if (!allTimeMinError && allTimeMinData) {
        minPodiumData = allTimeMinData;
      }
    }

    let minMatPodium72h = [];

    if (minPodiumData.length > 0) {
      const bestByEmail = new Map<string, any>();
      for (const item of minPodiumData) {
        const emailKey = String(item.email).toLowerCase().trim();
        const current = bestByEmail.get(emailKey);
        if (!current || item.score > current.score) {
          bestByEmail.set(emailKey, item);
        }
      }

      minMatPodium72h = Array.from(bestByEmail.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
          displayName: entry.name,
        }));
    }

    return NextResponse.json({
      success: true,
      profile,
      leaderboard,
      gecmisSampiyonlar,
      periodEnd,
      cupMatRewards,
      minMatRewards,
      cupMatPodium72h,
      minMatPodium72h,
    });
  } catch (error) {
    console.error("GET Gamification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, amount, displayName, forceReset, adminSecret } = body;

    if (forceReset) {
      if (!verifyAdminSecret(request, { adminSecret })) {
        return NextResponse.json(
          { error: "Admin yetkisi gerekli" },
          { status: 403 },
        );
      }
      await forceResetPeriod();
      return NextResponse.json({
        success: true,
        message: "Liderlik tablosu periyodu manuel olarak sıfırlandı!",
        leaderboard: await getGamificationLeaderboard(),
        gecmisSampiyonlar: await getGecmisSampiyonlar(),
      });
    }

    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;

    if (!action) {
      return NextResponse.json(
        { error: "Missing required field (action)" },
        { status: 400 },
      );
    }

    if (isBlockedGamificationAction(action) || !isAllowedGamificationAction(action)) {
      return NextResponse.json(
        { error: "Bu eylem izin verilmiyor" },
        { status: 403 },
      );
    }

    if (typeof amount === "number" && amount < 0) {
      return NextResponse.json(
        { error: "Puan azaltma veya negatif miktar izin verilmiyor" },
        { status: 403 },
      );
    }

    const result = await handleGamificationAction(
      userId,
      action,
      amount,
      displayName || authResult.displayName,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, profile: result.profile },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
      message: result.message,
      leaderboard: await getGamificationLeaderboard(),
    });
  } catch (error) {
    console.error("POST Gamification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
