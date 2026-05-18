import { NextResponse } from "next/server";
import {
  getOrCreateProfile,
  getGamificationLeaderboard,
  getGecmisSampiyonlar,
  getPeriodEnd,
  handleGamificationAction,
  forceResetPeriod,
  getProfileByDisplayName,
} from "@/lib/store/gamification-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const displayName = searchParams.get("displayName") || undefined;

    let profile = null;
    if (userId) {
      profile = getOrCreateProfile(userId, displayName);
    } else if (displayName) {
      profile = getProfileByDisplayName(displayName);
    }

    const leaderboard = getGamificationLeaderboard();
    const gecmisSampiyonlar = getGecmisSampiyonlar();
    const periodEnd = getPeriodEnd();

    return NextResponse.json({
      success: true,
      profile,
      leaderboard,
      gecmisSampiyonlar,
      periodEnd,
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
      forceResetPeriod();
      return NextResponse.json({
        success: true,
        message: "Liderlik tablosu periyodu manuel olarak sıfırlandı!",
        leaderboard: getGamificationLeaderboard(),
        gecmisSampiyonlar: getGecmisSampiyonlar(),
      });
    }

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields (userId, action)" },
        { status: 400 }
      );
    }

    const result = handleGamificationAction(userId, action, amount, displayName);

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
      leaderboard: getGamificationLeaderboard(),
    });
  } catch (error) {
    console.error("POST Gamification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
