import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await request.json();
    const { leagueId } = body;

    if (!leagueId) {
      return NextResponse.json({ success: false, error: "Geçersiz lig ID'si" }, { status: 400 });
    }

    // 1. Delete member record
    const { data, error: deleteErr } = await supabaseAdmin
      .from("private_league_members")
      .delete()
      .eq("league_id", leagueId)
      .eq("user_id", authResult.userId);

    if (deleteErr) {
      console.error("Error leaving private league:", deleteErr);
      return NextResponse.json({ success: false, error: "Ligden çıkış yapılamadı" }, { status: 500 });
    }

    // 2. Check remaining members count
    const { count, error: countErr } = await supabaseAdmin
      .from("private_league_members")
      .select("*", { count: "exact", head: true })
      .eq("league_id", leagueId);

    if (!countErr && (count === null || count === 0)) {
      // Delete empty league
      console.log(`Private league ${leagueId} is now empty. Deleting...`);
      await supabaseAdmin.from("private_leagues").delete().eq("id", leagueId);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Leagues leave POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
