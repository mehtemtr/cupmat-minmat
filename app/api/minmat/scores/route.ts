import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    let query = supabaseAdmin.from("minmat_leaderboard").select("*");
    if (filter !== "hepsi") {
      query = query.eq("category", filter);
    }
    
    const { data: scores, error: scoreError } = await query
      .order("high_score", { ascending: false })
      .limit(10);

    if (scoreError) throw scoreError;

    // Profilleri ayrı çekip hafızada birleştirerek veritabanı ilişki hatasını kökten çözüyoruz
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname");

    const profileMap = new Map(profiles?.map(p => [p.user_id, p.nickname]) || []);

    const formattedData = scores?.map(item => ({
      ...item,
      nickname: profileMap.get(item.user_id) || item.nickname || "Kullanıcı"
    })) || [];

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("MinMat scores GET hatası:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const score = body.score;
    const clerkUserId = body.clerkUserId;
    const mode = body.mappedMode || body.mode; 

    if (score === undefined || !mode || !clerkUserId) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    const { data: existingScore } = await supabaseAdmin
      .from("minmat_leaderboard")
      .select("*")
      .eq("user_id", clerkUserId)
      .eq("category", mode)
      .maybeSingle();

    const newHighScore = !existingScore || score > existingScore.high_score ? score : existingScore.high_score;
    const newRewardScore = !existingScore || score > existingScore.reward_score ? score : existingScore.reward_score;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("nickname")
      .eq("user_id", clerkUserId)
      .maybeSingle();

    const { error: upsertError } = await supabaseAdmin
      .from("minmat_leaderboard")
      .upsert({
        user_id: clerkUserId,
        category: mode,
        high_score: newHighScore,
        reward_score: newRewardScore,
        nickname: profile?.nickname || "Karakartal1923",
        updated_at: new Date().toISOString(),
      });

    if (upsertError) throw upsertError;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("MinMat scores POST hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
