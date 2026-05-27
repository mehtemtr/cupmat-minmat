import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkNickname = searchParams.get("nickname");
    
    if (checkNickname) {
      // Benzersizlik kontrolü (check endpoint'i)
      const { count, error } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("nickname", checkNickname.trim());

      if (error) {
        return NextResponse.json({ error: "Kontrol hatası" }, { status: 500 });
      }

      return NextResponse.json({ unique: count === 0 });
    }

    // Normal nickname çekme (Oturum doğrulaması ile)
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const email = authResult.email;

    // Profiles tablosunda kayıt var mı kontrol et
    let { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profil sorgulama hatası:", error);
      return NextResponse.json({ 
        error: "Profil sorgulama hatası",
        details: error.message,
        code: error.code,
        diagnostics: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 15) : "NONE"
        }
      }, { status: 500 });
    }

    // Profil yoksa otomatik oluşturalım
    if (!profile) {
      let counter = 1923;
      let finalNick = "";
      while (true) {
        finalNick = `Kartal${counter}`;
        const { count, error: countError } = await supabaseAdmin
          .from("profiles")
          .select("nickname", { count: "exact", head: true })
          .eq("nickname", finalNick);
        
        if (!countError && count === 0) {
          break;
        }
        counter++;
      }

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: userId,
          nickname: finalNick,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Profil oluşturma hatası:", insertError);
        return NextResponse.json({ 
          error: "Profil oluşturulamadı",
          details: insertError.message,
          code: insertError.code,
          diagnostics: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 15) : "NONE"
          }
        }, { status: 500 });
      }

      // Gamification store üzerinde de profili ilklendirelim
      const { getOrCreateProfile } = await import("@/lib/store/gamification-store");
      await getOrCreateProfile(userId, finalNick);

      return NextResponse.json({ nickname: finalNick });
    }

    // Profil var ama nicki yoksa otomatik KartalXXXX atayalım
    if (!profile.nickname || !profile.nickname.trim()) {
      let counter = 1923;
      let finalNick = "";
      while (true) {
        finalNick = `Kartal${counter}`;
        const { count, error: countError } = await supabaseAdmin
          .from("profiles")
          .select("nickname", { count: "exact", head: true })
          .eq("nickname", finalNick);
        
        if (!countError && count === 0) {
          break;
        }
        counter++;
      }

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ nickname: finalNick })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Profil nick güncelleme hatası:", updateError);
        return NextResponse.json({ 
          error: "Profil güncellenemedi",
          details: updateError.message,
          code: updateError.code,
          diagnostics: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET",
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 15) : "NONE"
          }
        }, { status: 500 });
      }

      // Gamification store üzerinde de profili güncelleyelim
      const { getOrCreateProfile } = await import("@/lib/store/gamification-store");
      await getOrCreateProfile(userId, finalNick);

      return NextResponse.json({ nickname: finalNick });
    }

    return NextResponse.json({ nickname: profile.nickname });
  } catch (error: any) {
    console.error("Nickname GET hatası:", error);
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

export async function PUT(request: Request) {
  try {
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const body = await request.json();
    const { nickname } = body;

    if (!nickname || !nickname.trim()) {
      return NextResponse.json({ error: "Geçersiz nickname" }, { status: 400 });
    }

    const userId = authResult.userId;
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ nickname: nickname.trim() })
      .eq("user_id", userId);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Bu takma ad zaten kullanımda, lütfen başka bir isim seçin!" }, { status: 400 });
      }
      return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
    }

    return NextResponse.json({ success: true, nickname: nickname.trim() });
  } catch (error: any) {
    console.error("Nickname PUT hatası:", error);
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
