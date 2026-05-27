import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

async function generateSequentialNickname(): Promise<string> {
  let counter = 1923;

  while (true) {
    const candidateNickname = `Kartal${counter}`;
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("nickname")
      .eq("nickname", candidateNickname);
    
    if (!existing || existing.length === 0) {
      return candidateNickname;
    }
    counter++;
  }
}

export async function POST(request: Request) {
  try {
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: "Eksik başlıklar" }, { status: 400 });
    }

    const payload = await request.text();
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Webhook doğrulama hatası:", err);
      return NextResponse.json({ error: "Geçersiz imza" }, { status: 400 });
    }

    const eventType = evt.type;
    console.log(`Webhook olayı alındı: ${eventType}`);

    if (eventType === "user.created" || eventType === "user.updated") {
      const userData = evt.data;
      const userId = userData.id;
      const email = userData.email_addresses?.[0]?.email_address;
      const userLocale = (userData as any).locale || "tr";

      if (!email) {
        return NextResponse.json(
          { error: "E-posta adresi yok" },
          { status: 400 }
        );
      }

      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json({
          success: true,
          message: "Mevcut kullanıcı güncellendi, veriler korundu",
          user: existingProfile,
        });
      }

      const nickname = await generateSequentialNickname();

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            user_id: userId,
            nickname: nickname,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Profil oluşturma hatası:", insertError);
        return NextResponse.json(
          { error: "Profil oluşturulamadı" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Yeni kullanıcı oluşturuldu ve başlatıldı",
        user: newProfile,
      });
    }

    return NextResponse.json({ success: true, message: "Olay kabul edildi" });
  } catch (error) {
    console.error("Webhook hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
