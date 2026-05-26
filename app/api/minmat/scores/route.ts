import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireApiAuth } from "@/lib/auth/api-auth";

// Supabase en üst düzey admin bağlantısı
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORIES = ["topla", "cikar", "carp", "bol", "karisik", "hepsi"] as const;
type Category = typeof CATEGORIES[number];

export async function GET(request: Request) {
  try {
    console.log("=== [API GET] MinMat scores isteği alındı ===");
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get("filter") || "hepsi") as Category;
    console.log("[API GET] Filtre:", filter);

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

    console.log("[API GET] Çekilen skorlar:", scores);
    if (scoreError) {
      console.error("[API GET] Skor çekme hatası:", scoreError);
      throw scoreError;
    }

    // profiles tablosundan canlı nickleri çekip RAM'de birleştiriyoruz
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, nickname");

    console.log("[API GET] Çekilen profiller:", profiles);
    if (profileError) {
      console.error("[API GET] Profil çekme hatası:", profileError);
    }

    const profileMap = new Map(profiles?.map(p => [p.user_id, p.nickname]) || []);

    const formattedData = scores?.map(item => ({
      ...item,
      nickname: profileMap.get(item.user_id) || item.nickname || "Kullanıcı"
    })) || [];

    console.log("[API GET] Formatlanmış veri:", formattedData);
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("[API GET] MinMat scores GET hatası:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== [API POST] MinMat scores isteği alındı ===");
    
    // Clerk authentication ile oturum kontrolü!
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      console.error("[API POST] Authentication hatası:", authResult.response);
      return authResult.response;
    }
    
    const clerkUserId = authResult.userId;
    console.log("[API POST] Clerk tarafından doğrulanan kullanıcı:", clerkUserId);
    
    const body = await request.json();
    console.log("[API POST] Gelen body:", body);
    console.log("[API POST] Tüm body anahtarları:", Object.keys(body));
    
    // Konsoldaki verilere göre esnek parametre yakalama motoru
    const score = body.score ?? body.highScore ?? body.puan;
    const mode = body.mappedMode ?? body.mode ?? body.category ?? body.kategori;

    console.log("[API POST] Ayrıştırılan parametreler:", { score, clerkUserId, mode });
    console.log("[API POST] Parametre tipleri:", { 
      score: typeof score, 
      clerkUserId: typeof clerkUserId, 
      mode: typeof mode 
    });

    // Eğer temel veriler eksikse 400 vermeden önce log basalım
    const missingParams = [];
    if (score === undefined) missingParams.push('score');
    if (!mode) missingParams.push('mode');
    
    if (missingParams.length > 0) {
      console.error("[API POST] Eksik temel parametreler!", missingParams);
      return NextResponse.json({ 
        error: "Eksik temel parametreler", 
        missing: missingParams,
        received: body
      }, { status: 400 });
    }

    // Kullanıcının nickini az önce elle kurduğun o profiles tablosundan canlı çekiyoruz!
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("nickname")
      .eq("user_id", clerkUserId)
      .maybeSingle();

    console.log("[API POST] Çekilen profil:", profile);
    const finalNickname = profile?.nickname || "Karakartal1923";
    console.log("[API POST] Final nickname:", finalNickname);

    // Mevcut skoru kontrol et
    const { data: existingScore } = await supabaseAdmin
      .from("minmat_leaderboard")
      .select("*")
      .eq("user_id", clerkUserId)
      .eq("category", mode)
      .maybeSingle();

    console.log("[API POST] Mevcut skor:", existingScore);

    const newHighScore = !existingScore || score > existingScore.high_score ? score : existingScore.high_score;
    const newRewardScore = !existingScore || score > existingScore.reward_score ? score : existingScore.reward_score;
    console.log("[API POST] Yeni skorlar:", { newHighScore, newRewardScore });

    // minmat_leaderboard tablosuna güvenle mühürle
    const { error: upsertError } = await supabaseAdmin
      .from("minmat_leaderboard")
      .upsert({
        user_id: clerkUserId,
        category: mode,
        high_score: newHighScore,
        reward_score: newRewardScore,
        nickname: finalNickname,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      console.error("[API POST] Upsert hatası:", upsertError);
      throw upsertError;
    }
    console.log("[API POST] Başarılı!");
    return NextResponse.json({ success: true, data: { high_score: newHighScore, nickname: finalNickname } });
  } catch (error: any) {
    console.error("[API POST] MinMat scores POST hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}
