export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { MOCK_MINLAN_CATEGORIES } from "@/lib/minlan/mock-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nativeLang = searchParams.get("native") || "all";
    const targetLang = searchParams.get("target") || "all";
    const categoryId = searchParams.get("category") || "all";

    let query = supabaseAdmin
      .from("minlan_leaderboard")
      .select(`
        user_id,
        native_lang,
        target_lang,
        score,
        category_id,
        created_at,
        profiles ( nickname, email )
      `)
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (nativeLang !== "all") {
      query = query.eq("native_lang", nativeLang);
    }
    if (targetLang !== "all") {
      query = query.eq("target_lang", targetLang);
    }
    if (categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const formattedData = data.map((item: any, index: number) => {
      const cat = MOCK_MINLAN_CATEGORIES.find(c => c.id === item.category_id);
      return {
        rank: index + 1,
        name: item.profiles?.nickname || item.profiles?.email?.split('@')[0] || "Unknown",
        score: item.score,
        native: item.native_lang,
        target: item.target_lang,
        category: cat ? cat.name_tr : "Bilinmeyen Kategori",
        date: item.created_at,
      };
    });

    return NextResponse.json({ success: true, leaderboard: formattedData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
