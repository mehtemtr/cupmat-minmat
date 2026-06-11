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
    const { boostType } = body;

    if (!boostType || !["time", "life", "score"].includes(boostType)) {
      return NextResponse.json({ error: "Invalid boostType" }, { status: 400 });
    }

    // Get profile
    const profile = await getOrCreateProfile(userId);

    // Apply consumption
    if (boostType === "time") {
      profile.minmatBoostTimeCharges = Math.max(0, (profile.minmatBoostTimeCharges || 0) - 1);
    } else if (boostType === "life") {
      profile.minmatBoostLifeCharges = Math.max(0, (profile.minmatBoostLifeCharges || 0) - 1);
    } else if (boostType === "score") {
      profile.minmatBoostScoreCharges = Math.max(0, (profile.minmatBoostScoreCharges || 0) - 1);
    }

    // Clear expiration date if all charges are empty
    if (
      (profile.minmatBoostTimeCharges || 0) === 0 &&
      (profile.minmatBoostLifeCharges || 0) === 0 &&
      (profile.minmatBoostScoreCharges || 0) === 0
    ) {
      profile.minmatBoostExpiresAt = "";
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
    console.error("Error consuming boost:", error);
    return NextResponse.json(
      { error: "Failed to consume boost", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
