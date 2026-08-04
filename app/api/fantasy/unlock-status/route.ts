import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { getOrCreateProfile, getGamificationLeaderboard } from "@/lib/store/gamification-store";
import { supabaseAdmin } from "@/lib/supabase";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const profile = await getOrCreateProfile(userId);

    // Parse query params
    const { searchParams } = new URL(request.url);
    const activeStage = (await redis.get<string>("fantasy_active_stage")) || "matchday_1";
    const stage = searchParams.get("stage") || activeStage;
    const teamIndex = parseInt(searchParams.get("teamIndex") || "1", 10);

    const isStageActive = stage.toLowerCase() === activeStage.toLowerCase();

    // Check if user already has a roster for this stage and team index
    const { data: existingRoster } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("id")
      .eq("user_id", userId)
      .eq("stage", stage)
      .eq("team_index", teamIndex)
      .maybeSingle();

    const hasRoster = !!existingRoster;

    const categories = ["add", "sub", "mul", "div", "mix"] as const;
    const maxLevels = profile.minmatMaxLevels || { add: 1, sub: 1, mul: 1, div: 1, mix: 1 };
    const gamesCount = profile.minmatGamesPlayedCount || { add: 0, sub: 0, mul: 0, div: 0, mix: 0 };

    // Determine unlock status and detailed status per category
    let isUnlocked = false;
    let categoryStatus: any[] = [];

    if (hasRoster) {
      // If a roster already exists, user is unlocked for this stage/teamIndex
      isUnlocked = true;
      categoryStatus = categories.map((cat) => {
        const level = maxLevels[cat] || 1;
        const gamesPlayed = gamesCount[cat] || 0;
        return {
          category: cat,
          level,
          gamesPlayed,
          unlocked: true,
        };
      });
    } else {
      // Any category with Level >= 5 is sufficient to unlock
      categoryStatus = categories.map((cat) => {
        const level = maxLevels[cat] || 1;
        const gamesPlayed = gamesCount[cat] || 0;
        const unlocked = level >= 5;
        return {
          category: cat,
          level,
          gamesPlayed,
          unlocked,
        };
      });
      isUnlocked = categoryStatus.some((status) => status.unlocked);
    }

    // Calculate total games played across all categories
    const totalGamesPlayed = Object.values(gamesCount).reduce((sum, count) => sum + count, 0);

    // Fetch leaderboard to see if user is in top 10
    let isInTop10 = false;
    try {
      const leaderboard = await getGamificationLeaderboard();
      const userIndex = leaderboard.findIndex((u) => u.userId === userId);
      if (userIndex >= 0 && userIndex < 10) {
        isInTop10 = true;
      }
    } catch (e) {
      console.error("Error checking leaderboard for top 10:", e);
    }

    // Determine maxTeams (1, 2, 3, or 4)
    let maxTeams = 1;
    if (isInTop10) {
      maxTeams = 4;
    } else if (totalGamesPlayed >= 30) {
      maxTeams = 3;
    } else if (totalGamesPlayed >= 15) {
      maxTeams = 2;
    }

    // Determine benchSlots (0, 1, 2, or 3)
    let benchSlots = 0;
    const countLevel10 = categories.filter((cat) => (maxLevels[cat] || 1) >= 10).length;
    const countLevel7 = categories.filter((cat) => (maxLevels[cat] || 1) >= 7).length;
    const countLevel5 = categories.filter((cat) => (maxLevels[cat] || 1) >= 5).length;

    if (countLevel10 >= 3) {
      benchSlots = 3;
    } else if (countLevel7 >= 3) {
      benchSlots = 2;
    } else if (countLevel5 >= 3) {
      benchSlots = 1;
    }

    return NextResponse.json({
      success: true,
      stage,
      unlocked: isUnlocked,
      hasRoster,
      isStageActive,
      minmatOyunSayisiBugun: profile.minmatOyunSayisiBugun || 0,
      progress: {
        maxLevels,
        gamesCount,
        categoryStatus,
        totalGamesPlayed,
      },
      maxTeams,
      benchSlots,
    });
  } catch (error: any) {
    console.error("Unlock status API error:", error);
    return NextResponse.json(
      { error: "Unlock status calculation failed", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

