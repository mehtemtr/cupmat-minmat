import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { registerMinMatGamePlayedByUserId } from "@/lib/store/gamification-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const type = searchParams.get("type") || "leaderboard";

    if (type === "podium") {
      const seventyTwoHoursAgo = Date.now() - 72 * 60 * 60 * 1000;

      // 1. Önce son 72 saatteki verileri çek
      const { data: recentData, error: recentError } = await supabaseAdmin
        .from("minmat_leaderboard")
        .select("*")
        .gte("timestamp", seventyTwoHoursAgo)
        .not("email", "is", null);

      if (recentError) {
        console.error("Podium fetch error:", recentError);
        return NextResponse.json({ success: false, podium: [] });
      }

      let podiumData = recentData || [];

      // 2. Eğer son 72 saatte veri yoksa, tüm zamanların en yüksek skorlarını çek (fallback)
      if (podiumData.length === 0) {
        console.log("Son 72 saatte veri yok, tüm zamanların en yüksek skorları çekiliyor...");
        const { data: allTimeData, error: allTimeError } = await supabaseAdmin
          .from("minmat_leaderboard")
          .select("*")
          .not("email", "is", null)
          .order("score", { ascending: false })
          .limit(100);

        if (!allTimeError && allTimeData) {
          podiumData = allTimeData;
        }
      }

      const bestByEmail = new Map<string, any>();
      for (const item of podiumData) {
        const emailKey = String(item.email).toLowerCase().trim();
        const current = bestByEmail.get(emailKey);
        if (!current || item.score > current.score) {
          bestByEmail.set(emailKey, item);
        }
      }

      const podium = Array.from(bestByEmail.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
          displayName: entry.name,
        }));

      return NextResponse.json({ success: true, podium });
    }

    let query = supabaseAdmin
      .from("minmat_leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(10);

    if (filter && filter !== "all") {
      query = query.eq("mode", filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Leaderboard fetch error:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error("MinMat leaderboard GET error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await request.json();

    if (
      typeof body.score !== "number" ||
      typeof body.level !== "number" ||
      typeof body.mode !== "string" ||
      !body.mode.trim()
    ) {
      return NextResponse.json(
        { success: false, error: "Geçersiz skor verisi" },
        { status: 400 },
      );
    }

    const safeName = authResult.displayName && authResult.displayName !== 'Kullanıcı' 
      ? authResult.displayName 
      : (authResult.email ? authResult.email.split('@')[0] : 'Oyuncu');

    const scoreEntry = {
      name: safeName,
      email: authResult.email || "",
      score: body.score,
      level: body.level,
      mode: body.mode,
      timestamp: body.timestamp || Date.now(),
      date: body.date || new Date().toLocaleDateString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const { error } = await supabaseAdmin
      .from("minmat_leaderboard")
      .insert([scoreEntry]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Kaydedilemedi" },
        { status: 500 },
      );
    }

    await registerMinMatGamePlayedByUserId(
      authResult.userId,
      authResult.displayName,
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("MinMat leaderboard POST error:", error);
    return NextResponse.json(
      { success: false, error: "Kaydedilemedi" },
      { status: 500 },
    );
  }
}
