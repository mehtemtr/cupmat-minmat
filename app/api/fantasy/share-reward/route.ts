import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const body = await request.json();
    const { stage, teamIndex } = body;

    if (!stage || !teamIndex) {
      return NextResponse.json(
        { error: "Eksik parametreler: stage ve teamIndex gereklidir." },
        { status: 400 }
      );
    }

    // 1. Check if already claimed for this stage/matchday in Redis
    const redisKey = `fantasy:share_bonus_claimed:${userId}:${stage.toLowerCase()}`;
    const alreadyClaimed = await redis.get<number>(redisKey);

    if (alreadyClaimed) {
      return NextResponse.json({
        success: false,
        error: "Bu maç günü için paylaşım ödülünüzü zaten aldınız.",
        alreadyClaimed: true,
      });
    }

    // 2. Fetch roster from Supabase
    // Try to fetch with share_bonus_points, fallback if column doesn't exist yet
    let roster: any = null;
    let hasShareBonusColumn = true;

    const { data: firstTry, error: firstError } = await supabaseAdmin
      .from("fantasy_rosters")
      .select("id, points, share_bonus_points")
      .eq("user_id", userId)
      .eq("stage", stage)
      .eq("team_index", teamIndex)
      .maybeSingle();

    if (firstError) {
      // If error (possibly due to missing column), retry selecting only points
      console.warn("Retrying query without share_bonus_points column...", firstError);
      hasShareBonusColumn = false;
      const { data: secondTry, error: secondError } = await supabaseAdmin
        .from("fantasy_rosters")
        .select("id, points")
        .eq("user_id", userId)
        .eq("stage", stage)
        .eq("team_index", teamIndex)
        .maybeSingle();

      if (secondError) {
        throw secondError;
      }
      roster = secondTry;
    } else {
      roster = firstTry;
    }

    if (!roster) {
      return NextResponse.json({
        success: false,
        error: "Ödül kazanmak için önce bu maç gününde kadronuzu kurmuş ve kaydetmiş olmalısınız.",
      });
    }

    // Double check column limit if it exists in retrieved data
    if (hasShareBonusColumn && (roster.share_bonus_points || 0) >= 5) {
      return NextResponse.json({
        success: false,
        error: "Bu maç günü için maksimum paylaşım puan sınırına ulaştınız.",
        alreadyClaimed: true,
      });
    }

    // 3. Update points and share_bonus_points in Supabase
    const currentPoints = roster.points || 0;
    const currentShareBonus = hasShareBonusColumn ? (roster.share_bonus_points || 0) : 0;

    const updatePayload: Record<string, any> = {
      points: currentPoints + 5,
      updated_at: new Date().toISOString(),
    };

    if (hasShareBonusColumn) {
      updatePayload.share_bonus_points = currentShareBonus + 5;
    }

    const { error: updateError } = await supabaseAdmin
      .from("fantasy_rosters")
      .update(updatePayload)
      .eq("id", roster.id);

    if (updateError) {
      throw updateError;
    }

    // 4. Save to Redis with 30-day expiration to prevent double-claiming
    await redis.set(redisKey, 1, { ex: 30 * 24 * 60 * 60 });

    return NextResponse.json({
      success: true,
      message: "Kadroyu paylaştığınız için +5 bonus puan başarıyla eklendi!",
      pointsAdded: 5,
    });
  } catch (error: any) {
    console.error("POST share-reward error:", error);
    return NextResponse.json(
      { error: "Paylaşım ödülü yüklenemedi", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
