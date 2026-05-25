import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// .env dosyasındaki en üst düzey yönetici anahtarını kullanan canavar istemci
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORIES = ["topla", "cikar", "carp", "bol", "karisik", "hepsi"] as const;
type Category = typeof CATEGORIES[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get("filter") || "hepsi") as Category;

    if (!CATEGORIES.includes(filter)) {
      return NextResponse.json({ error: "Geçersiz kategori" }, { status: 400 });
    }

    // Kırık profiles tablosu araması kaldırıldı, doğrudan gerçek tablodan çekiyoruz
    if (filter === "hepsi") {
      const { data: allData, error } = await supabaseAdmin
        .from("minmat_leaderboard")
        .select("*")
        .order("high_score", { ascending: false })
        .limit(10);

      if (error) throw error;
      return NextResponse.json(allData || []);
    }

    const { data, error } = await supabaseAdmin
      .from("minmat_leaderboard")
      .select("*")
      .eq("category", filter)
      .order("high_score", { ascending: false })
      .limit(10);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("MinMat scores GET hatası:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { score, level, mode, clerkUserId, nickname } = body;

    if (!score || !mode || !clerkUserId) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    // Gerçek tablo olan minmat_leaderboard üzerinde arama yapıyoruz
    const { data: existingScore, error: fetchError } = await supabaseAdmin
      .from("minmat_leaderboard")
      .select("*")
      .eq("user_id", clerkUserId)
      .eq("category", mode)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    const newHighScore =
      !existingScore || score > existingScore.high_score ? score : existingScore.high_score;
    const newRewardScore =
      !existingScore || score > existingScore.reward_score ? score : existingScore.reward_score;

    // Puanla birlikte oyun anındaki güncel takma adı (nickname) doğrudan mühürlüyoruz
    const { error: upsertError } = await supabaseAdmin
      .from("minmat_leaderboard")
      .upsert({
        user_id: clerkUserId,
        category: mode,
        high_score: newHighScore,
        reward_score: newRewardScore,
        nickname: nickname || "Kullanıcı",
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,category' });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("MinMat scores POST hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
