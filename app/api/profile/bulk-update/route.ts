import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, nickname, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Bulk GET hatası:", error);
    return NextResponse.json({ error: "Veriler çekilemedi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Geçersiz format: dizi bekleniyor" }, { status: 400 });
    }

    const updates = body.map((profile: any) => ({
      id: profile.id,
      nickname: profile.nickname?.trim() || null,
    }));

    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(updates, { onConflict: "id" });

    if (error) throw error;

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error("Bulk POST hatası:", error);
    return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
  }
}
