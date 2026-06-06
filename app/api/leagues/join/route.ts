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
    const { joinCode } = body;

    if (!joinCode || typeof joinCode !== "string") {
      return NextResponse.json({ success: false, error: "Geçersiz giriş kodu" }, { status: 400 });
    }

    const cleanCode = joinCode.trim().toUpperCase();

    // 1. Find the league by join code
    const { data: league, error: leagueErr } = await supabaseAdmin
      .from("private_leagues")
      .select("*")
      .eq("join_code", cleanCode)
      .maybeSingle();

    if (leagueErr || !league) {
      return NextResponse.json({ success: false, error: "Girdiğiniz kod ile eşleşen bir lig bulunamadı" }, { status: 404 });
    }

    // 2. Check if already a member
    const { data: existingMember } = await supabaseAdmin
      .from("private_league_members")
      .select("id")
      .eq("league_id", league.id)
      .eq("user_id", authResult.userId)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json({ success: false, error: "Bu lige zaten katılmış durumdasınız" }, { status: 400 });
    }

    // 3. Add user as member
    const { error: insertErr } = await supabaseAdmin
      .from("private_league_members")
      .insert({
        league_id: league.id,
        user_id: authResult.userId,
      });

    if (insertErr) {
      console.error("Error joining private league:", insertErr);
      return NextResponse.json({ success: false, error: "Lige katılım sağlanamadı" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      league: {
        id: league.id,
        name: league.name,
      }
    });

  } catch (error) {
    console.error("Leagues join POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
