import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchesEarned, scoreEarned, categoryId, nativeLang = "tr", targetLang = "en" } = body;

    const matches = parseInt(matchesEarned || "0", 10);
    const score = parseInt(scoreEarned || "0", 10);
    
    // Resolve internal profile ID from Clerk Auth
    let internalUserId = null;
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", clerkUserId)
        .maybeSingle();
      if (profile) {
        internalUserId = profile.id;
      }
    }

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
    if (internalUserId && categoryId && score > 0) {
      try {
        const { data: existing, error: selectErr } = await supabaseAdmin
          .from("minlan_user_progress")
          .select("total_score, max_round_reached, total_matches_count")
          .eq("user_id", internalUserId)
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
             user_id: internalUserId,
             category_id: categoryId,
             native_lang: nativeLang, 
             target_lang: targetLang, 
             total_score: currentScore + score,
             total_matches_count: currentMatchesCount + matches,
             updated_at: new Date().toISOString()
          }, { onConflict: "user_id, category_id, native_lang, target_lang" });
      } catch (e) {
        console.warn("Could not update user progress:", e);
      }
    }

    // 3. Insert Session Score into Leaderboard
    const sessionScore = parseInt(body.sessionScore || "0", 10);
    if (internalUserId && categoryId && sessionScore > 0) {
      try {
        await supabaseAdmin
          .from("minlan_leaderboard")
          .insert({
            user_id: internalUserId,
            category_id: categoryId,
            native_lang: nativeLang,
            target_lang: targetLang,
            score: sessionScore,
            matches_count: 0 // Optional: if we wanted to track session matches
          });
      } catch (e) {
        console.error("Could not insert into minlan_leaderboard:", e);
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
