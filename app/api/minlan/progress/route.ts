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

    return NextResponse.json({
      success: true,
      matchesAdded: matches,
      scoreAdded: score,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
