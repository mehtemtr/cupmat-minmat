import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { getOrCreateProfile, getStore, saveStore } from "@/lib/store/gamification-store";

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const body = await request.json();
    const { rewardType } = body;

    if (!rewardType || !["time", "life", "score"].includes(rewardType)) {
      return NextResponse.json({ error: "Invalid rewardType" }, { status: 400 });
    }

    // Get profile
    const profile = await getOrCreateProfile(userId);

    // Apply reward
    if (rewardType === "time") {
      profile.minmatBoostTimeCharges = Math.min(3, (profile.minmatBoostTimeCharges || 0) + 1);
    } else if (rewardType === "life") {
      profile.minmatBoostLifeCharges = Math.min(3, (profile.minmatBoostLifeCharges || 0) + 1);
    } else if (rewardType === "score") {
      profile.minmatBoostScoreCharges = Math.min(3, (profile.minmatBoostScoreCharges || 0) + 1);
    }

    // Set 12-hour expiration from first claim (if not set or already expired)
    const now = new Date();
    const hasActiveExpires = profile.minmatBoostExpiresAt && (new Date(profile.minmatBoostExpiresAt) > now);
    if (!hasActiveExpires) {
      const expires = new Date();
      expires.setHours(expires.getHours() + 12);
      profile.minmatBoostExpiresAt = expires.toISOString();
    }

    // Save profile to store
    const store = await getStore();
    const idx = store.userActivities.findIndex((u) => u.userId === userId);
    if (idx >= 0) {
      store.userActivities[idx] = profile;
      await saveStore(store);
    }

    return NextResponse.json({
      success: true,
      minmatBoostTimeCharges: profile.minmatBoostTimeCharges,
      minmatBoostLifeCharges: profile.minmatBoostLifeCharges,
      minmatBoostScoreCharges: profile.minmatBoostScoreCharges,
      minmatBoostExpiresAt: profile.minmatBoostExpiresAt,
    });
  } catch (error: any) {
    console.error("Error claiming reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
