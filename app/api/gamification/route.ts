import { NextResponse } from "next/server";
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
    const userId = searchParams.get("userId");
    const displayName = searchParams.get("displayName") || undefined;

    let profile = null;
    if (userId) {
      profile = await getOrCreateProfile(userId, displayName);
    } else if (displayName) {
      profile = await getProfileByDisplayName(displayName);
    }

    const leaderboard = await getGamificationLeaderboard();
    const gecmisSampiyonlar = await getGecmisSampiyonlar();
    const periodEnd = await getPeriodEnd();
    const { cupMatRewards, minMatRewards } = await getRewardLeaderboards();

    return NextResponse.json({
      success: true,
      profile,
      leaderboard,
      gecmisSampiyonlar,
      periodEnd,
      cupMatRewards,
      minMatRewards,
    });
  } catch (error) {
    console.error("GET Gamification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, amount, displayName, forceReset } = body;

    // Support admin/testing trigger for manual periyot reset
    if (forceReset) {
      await forceResetPeriod();
      return NextResponse.json({
        success: true,
        message: "Liderlik tablosu periyodu manuel olarak sıfırlandı!",
        leaderboard: await getGamificationLeaderboard(),
        gecmisSampiyonlar: await getGecmisSampiyonlar(),
      });
    }

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields (userId, action)" },
        { status: 400 }
      );
    }

    const result = await handleGamificationAction(userId, action, amount, displayName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, profile: result.profile },
        { status: 400 }
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
