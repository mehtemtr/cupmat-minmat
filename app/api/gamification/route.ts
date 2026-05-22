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
    const { getMinMatRewardPodium } = await import(
      "@/lib/store/minmat-leaderboard-store"
    );
    const minMatPodium72h = await getMinMatRewardPodium();

    return NextResponse.json({
      success: true,
      profile,
      leaderboard,
      gecmisSampiyonlar,
      periodEnd,
      cupMatRewards,
      minMatRewards,
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
