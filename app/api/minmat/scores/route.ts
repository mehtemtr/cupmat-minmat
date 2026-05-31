import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireApiAuth } from "@/lib/auth/api-auth";

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
      const modeMap: Record<string, string[]> = {
        "topla": ["add", "topla"],
        "cikar": ["sub", "cikar"],
        "carp": ["mul", "carp"],
        "bol": ["div", "bol"],
        "karisik": ["mix", "karisik"]
      };
      const dbModes = modeMap[filter] || [filter];
      query = query.in("mode", dbModes);
    }
    
    const { data: scores, error: scoreError } = await query
      .order("score", { ascending: false })
      .limit(10);

    console.log("[API GET] Çekilen skorlar:", scores);
    if (scoreError) {
      console.error("[API GET] Skor çekme hatası:", scoreError);
      throw scoreError;
    }

    const emailToNicknameMap = new Map<string, string>();
    
    // Redis gamification store'dan e-posta -> nick eşleştirmelerini RAM'e yükle
    try {
      const { getStore } = await import("@/lib/store/gamification-store");
      const store = await getStore();
      store.userActivities.forEach((u) => {
        if (u.email) {
          emailToNicknameMap.set(u.email.toLowerCase().trim(), u.displayName);
        }
      });
    } catch (e) {
      console.error("[API GET] Redis'ten profil eşleştirme yüklenemedi:", e);
    }

    // Supabase profiles tablosundan canlı nickleri çekip RAM'de e-posta ile eşleştirmeyi dene (kolon varsa)
    try {
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("email, nickname");

      if (profiles && !profileError) {
        profiles.forEach(p => {
          if (p.email) {
            emailToNicknameMap.set(p.email.toLowerCase().trim(), p.nickname);
          }
        });
      }
    } catch (e) {
      console.warn("[API GET] Supabase profiles email seçilemedi (normal - yerel şemada sütun yok):", e);
    }

    // Kategori ismini eski frontend formatına çeviren yardımcı fonksiyon
    function mapCategoryReverse(newCat: string) {
      const map: Record<string, string> = {
        "add": "topla",
        "sub": "cikar",
        "mul": "carp",
        "div": "bol",
        "mix": "karisik"
      };
      return map[newCat] || newCat;
    }

    const formattedData = scores?.map(item => {
      const emailKey = item.email?.toLowerCase().trim();
      const finalNick = (emailKey && emailToNicknameMap.get(emailKey)) || item.name || "Kullanıcı";
      return {
        id: item.id,
        nickname: finalNick,
        category: mapCategoryReverse(item.mode),
        high_score: item.score,
        level: item.level,
        updated_at: new Date(item.timestamp || Date.now()).toISOString()
      };
    }) || [];

    console.log("[API GET] Formatlanmış veri:", formattedData);
    return NextResponse.json(formattedData);
  } catch (error: any) {
    console.error("[API GET] MinMat scores GET hatası:", error);
    return NextResponse.json({ 
      error: "Sunucu hatası", 
      details: error?.message || String(error),
      diagnostics: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 15) : "NONE"
      }
    }, { status: 500 });
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
    const userEmail = authResult.email;
    console.log("[API POST] Clerk tarafından doğrulanan kullanıcı:", clerkUserId, "Email:", userEmail);
    
    const body = await request.json();
    console.log("[API POST] Gelen body:", body);
    
    // Konsoldaki verilere göre esnek parametre yakalama motoru
    const score = Number(body.score ?? body.highScore ?? body.puan ?? 0);
    const level = Number(body.level ?? body.tur ?? 1);
    const mode = body.mappedMode ?? body.mode ?? body.category ?? body.kategori ?? "mix";

    console.log("[API POST] Ayrıştırılan parametreler:", { score, level, userEmail, mode });

    // Kullanıcının nickini profiles tablosundan çekiyoruz (user_id Clerk userId'dir)
    let profile = null;
    try {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("nickname")
        .eq("user_id", clerkUserId)
        .maybeSingle();
      if (data) profile = data;
    } catch (e) {
      console.error("Profiles query by user_id failed", e);
    }

    console.log("[API POST] Çekilen profil:", profile);
    const finalNickname = profile?.nickname || authResult.displayName || "Kullanıcı";
    console.log("[API POST] Final nickname:", finalNickname);

    // minmat_leaderboard tablosuna yeni skoru insert ediyoruz
    const { error: insertError } = await supabaseAdmin
      .from("minmat_leaderboard")
      .insert({
        name: finalNickname,
        email: userEmail,
        score: score,
        level: level,
        mode: mode,
        date: new Date().toLocaleDateString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        timestamp: Date.now()
      });

    if (insertError) {
      console.error("[API POST] Insert hatası:", insertError);
      throw insertError;
    }

    // Auto-award prediction update key (tahminGuncellemeHakki) if score is >= 300
    if (score >= 300) {
      try {
        const { handleGamificationAction } = await import("@/lib/store/gamification-store");
        await handleGamificationAction(clerkUserId, "earn_prediction_right", 1);
        console.log(`[API POST] Auto-awarded prediction key to user ${clerkUserId} for score ${score}`);
      } catch (err) {
        console.error("[API POST] Failed to auto-award prediction key:", err);
      }
    }

    console.log("[API POST] Başarılı!");
    return NextResponse.json({ success: true, data: { high_score: score, nickname: finalNickname } });
  } catch (error: any) {
    console.error("[API POST] MinMat scores POST hatası:", error);
    return NextResponse.json({ 
      error: "Sunucu hatası", 
      details: error?.message || String(error),
      diagnostics: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 15) : "NONE"
      }
    }, { status: 500 });
  }
}
