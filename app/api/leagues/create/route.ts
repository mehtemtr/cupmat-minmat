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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ success: false, error: "Lig adı en az 3 karakter olmalıdır" }, { status: 400 });
    }

    // 1. Generate unique 6-character join code
    let joinCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      attempts++;
      // Generate alphanumeric 6 chars (e.g. A-Z, 0-9)
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      const { data: existing } = await supabaseAdmin
        .from("private_leagues")
        .select("id")
        .eq("join_code", code)
        .maybeSingle();

      if (!existing) {
        joinCode = code;
        isUnique = true;
      }
    }

    if (!joinCode) {
      return NextResponse.json({ success: false, error: "Giriş kodu oluşturulamadı, lütfen tekrar deneyin" }, { status: 500 });
    }

    // 2. Insert private league
    const { data: league, error: leagueErr } = await supabaseAdmin
      .from("private_leagues")
      .insert({
        name: name.trim(),
        created_by: authResult.userId,
        join_code: joinCode,
      })
      .select("*")
      .single();

    if (leagueErr || !league) {
      console.error("Error creating private league:", leagueErr);
      return NextResponse.json({ success: false, error: "Lig oluşturulamadı" }, { status: 500 });
    }

    // 3. Add creator to private_league_members
    const { error: memberErr } = await supabaseAdmin
      .from("private_league_members")
      .insert({
        league_id: league.id,
        user_id: authResult.userId,
      });

    if (memberErr) {
      console.error("Error adding creator to private league members:", memberErr);
      // Rollback league creation
      await supabaseAdmin.from("private_leagues").delete().eq("id", league.id);
      return NextResponse.json({ success: false, error: "Üyelik kaydı oluşturulamadı" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      league: {
        id: league.id,
        name: league.name,
        joinCode: league.join_code,
        createdBy: league.created_by,
        createdAt: league.created_at,
        memberCount: 1,
      }
    });

  } catch (error) {
    console.error("Leagues create POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
