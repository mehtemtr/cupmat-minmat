import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyAdminSecret } from "@/lib/auth/api-auth";

const REDIS_KEY = "minmat_leaderboard";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!verifyAdminSecret(request, body)) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 },
      );
    }

    console.log("=== Vercel KV'den Supabase'e migrasyon başlıyor ===");

    const kvData = await kv.get<any[]>(REDIS_KEY);
    if (!kvData || !Array.isArray(kvData) || kvData.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Vercel KV'de veri yok veya boş",
        migrated: 0
      });
    }

    console.log(`KV'den ${kvData.length} kayıt alındı`);

    const migratedScores = [];
    let skipped = 0;

    for (const item of kvData) {
      if (!item.name || !item.score) {
        skipped++;
        continue;
      }

      const scoreEntry = {
        name: item.name,
        email: item.email || item.name || "unknown@example.com",
        score: Number(item.score) || 0,
        level: Number(item.level) || 1,
        mode: item.mode || "mix",
        date: item.date || "",
        timestamp: item.timestamp || Date.now(),
      };

      migratedScores.push(scoreEntry);
    }

    console.log(`${migratedScores.length} kayıt Supabase'e aktarılacak, ${skipped} atlandı`);

    if (migratedScores.length > 0) {
      const { error } = await supabaseAdmin
        .from("minmat_leaderboard")
        .insert(migratedScores);

      if (error) {
        console.error("Supabase insert hatası:", error);
        return NextResponse.json(
          { success: false, error: "Supabase'e kaydedilemedi" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migrasyon tamamlandı",
      migrated: migratedScores.length,
      skipped: skipped
    });

  } catch (error) {
    console.error("Migrasyon hatası:", error);
    return NextResponse.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    if (!verifyAdminSecret(request)) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 },
      );
    }

    const kvData = await kv.get<any[]>(REDIS_KEY);

    return NextResponse.json({
      success: true,
      kvCount: kvData ? kvData.length : 0,
      kvData: kvData?.slice(0, 5) || []
    });

  } catch (error) {
    console.error("KV kontrol hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 },
    );
  }
}
