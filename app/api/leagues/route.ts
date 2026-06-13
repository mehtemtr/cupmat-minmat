import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    // Fetch member records
    const { data: memberRows, error: memberError } = await supabaseAdmin
      .from("private_league_members")
      .select(`
        league_id,
        joined_at,
        private_leagues (
          id,
          name,
          created_by,
          join_code,
          created_at
        )
      `)
      .eq("user_id", authResult.userId);

    if (memberError) {
      console.error("Error fetching private leagues:", memberError);
      return NextResponse.json({ success: false, error: "Veritabanı hatası" }, { status: 500 });
    }

    const leagues = await Promise.all(
      (memberRows || []).map(async (row: any) => {
        const league = row.private_leagues;
        if (!league) return null;

        // Fetch member count
        const { count, error: countErr } = await supabaseAdmin
          .from("private_league_members")
          .select("*", { count: "exact", head: true })
          .eq("league_id", league.id);

        // Fetch creator profile
        const { data: creatorProfile } = await supabaseAdmin
          .from("profiles")
          .select("nickname")
          .eq("user_id", league.created_by)
          .maybeSingle();

        return {
          id: league.id,
          name: league.name,
          createdBy: league.created_by,
          creatorNickname: creatorProfile?.nickname || "Kurucu",
          joinCode: league.join_code,
          createdAt: league.created_at,
          joinedAt: row.joined_at,
          memberCount: count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      leagues: leagues.filter(Boolean)
    });

  } catch (error) {
    console.error("Leagues GET error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
