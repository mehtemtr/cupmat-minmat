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

    // Normal nickname çekme
    const authResult = await requireApiAuth();
    if (!authResult.ok) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("nickname")
      .eq("id", userId)
      .single();

    if (error) {
      return NextResponse.json({ error: "Profil bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Nickname GET hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
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
      .eq("id", userId);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Bu takma ad zaten kullanımda, lütfen başka bir isim seçin!" }, { status: 400 });
      }
      return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
    }

    return NextResponse.json({ success: true, nickname: nickname.trim() });
  } catch (error) {
    console.error("Nickname PUT hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
