import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchesEarned, scoreEarned, userId, categoryId } = body;

    const matches = parseInt(matchesEarned || "0", 10);
    const score = parseInt(scoreEarned || "0", 10);

    if (matches > 0) {
      // 1. Increment Community Matches Counter in DB
      try {
        const { data: currentStats } = await supabaseAdmin
          .from("minlan_community_stats")
          .select("total_card_matches")
          .eq("id", 1)
          .single();

        const currentMatches = currentStats?.total_card_matches || 18420;
        const newTotal = currentMatches + matches;

        await supabaseAdmin
          .from("minlan_community_stats")
          .upsert({ id: 1, total_card_matches: newTotal, updated_at: new Date().toISOString() });
      } catch (e) {
        console.warn("Could not update community stats in DB:", e);
      }
    }

    // 2. Insert/Update User Progress
    if (userId && categoryId && score > 0) {
      try {
        const { data: existing, error: selectErr } = await supabaseAdmin
          .from("minlan_user_progress")
          .select("total_score, max_round_reached, total_matches_count")
          .eq("user_id", userId)
          .eq("category_id", categoryId)
          .maybeSingle();

        if (selectErr) {
          console.error("Error checking existing progress:", selectErr);
        }

        const currentScore = existing?.total_score || 0;
        const currentMatchesCount = existing?.total_matches_count || 0;
        const currentRound = existing?.max_round_reached || 1;

        // Optionally, max_round could be passed from client if known
        
        await supabaseAdmin
          .from("minlan_user_progress")
          .upsert({
             user_id: userId,
             category_id: categoryId,
             native_lang: "tr", // Should be dynamic if user can change, assuming tr
             target_lang: "en", // Assuming en for now, or fetch from request
             total_score: currentScore + score,
             total_matches_count: currentMatchesCount + matches,
             updated_at: new Date().toISOString()
          }, { onConflict: "user_id, category_id, native_lang, target_lang" });
      } catch (e) {
        console.warn("Could not update user progress:", e);
      }
    }

    return NextResponse.json({
      success: true,
      matchesAdded: matches,
      scoreAdded: score,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
