import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("cupmat_leaderboard")
      .select("*")
      .order("points", { ascending: false })
      .limit(100);

    if (error) {
      console.error("CupMat leaderboard fetch error:", error);
      return NextResponse.json({ leaderboard: [] });
    }

    return NextResponse.json({ leaderboard: data || [] });
  } catch (error) {
    console.error("CupMat leaderboard GET error:", error);
    return NextResponse.json({ leaderboard: [] });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await request.json();

    if (!body.displayName || typeof body.points !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (body.points < 0) {
      return NextResponse.json(
        { error: "Puanlar azaltılamaz veya silinemez" },
        { status: 403 },
      );
    }

    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from("cupmat_leaderboard")
      .select("*")
      .eq("user_id", authResult.userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("CupMat fetch existing error:", fetchError);
      return NextResponse.json(
        { error: "Veritabanı hatası" },
        { status: 500 },
      );
    }

    if (existingData && body.points < existingData.points) {
      return NextResponse.json(
        { error: "Puanlar azaltılamaz. Mevcut puanınız korunur." },
        { status: 403 },
      );
    }

    const entry = {
      user_id: authResult.userId,
      display_name: authResult.displayName,
      match_predictions: body.matchPredictions ?? existingData?.match_predictions ?? {},
      points: Math.max(existingData?.points ?? 0, body.points),
      groups_complete: body.groupsComplete ?? existingData?.groups_complete ?? false,
      submitted_at: new Date().toISOString(),
    };

    let result;
    if (existingData) {
      result = await supabaseAdmin
        .from("cupmat_leaderboard")
        .update(entry)
        .eq("user_id", authResult.userId)
        .select("*")
        .single();
    } else {
      result = await supabaseAdmin
        .from("cupmat_leaderboard")
        .insert([entry])
        .select("*")
        .single();
    }

    if (result.error) {
      console.error("CupMat upsert error:", result.error);
      return NextResponse.json(
        { error: "Kaydedilemedi" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, entry: result.data });

  } catch (error) {
    console.error("CupMat leaderboard POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
