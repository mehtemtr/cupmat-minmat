import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

async function generateUniqueNickname(
  email: string,
  locale: string = "tr"
): Promise<string> {
  const emailPrefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
  
  if (emailPrefix.length >= 3) {
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("nickname")
      .eq("nickname", emailPrefix);
    if (!existing || existing.length === 0) {
      return emailPrefix;
    }
  }

  const fallbackNames: Record<string, string> = {
    tr: "Karakartal",
    en: "BlackEagle",
    de: "SchwarzerAdler",
    fr: "AigleNoir",
    es: "AguilaNegra",
  };

  const baseName = fallbackNames[locale] || fallbackNames.tr;
  let counter = 1923;

  while (true) {
    const candidateNickname = `${baseName}${counter}`;
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
        .eq("id", userId)
        .single();

      if (existingProfile) {
        await supabaseAdmin
          .from("profiles")
          .update({
            email: email,
          })
          .eq("id", userId);

        return NextResponse.json({
          success: true,
          message: "Mevcut kullanıcı güncellendi, veriler korundu",
          user: existingProfile,
        });
      }

      const nickname = await generateUniqueNickname(email, userLocale);

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            id: userId,
            email: email,
            nickname: nickname,
            cupmat_general_score: 0,
            cupmat_reward_score: 0,
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

      const categories = ["topla", "cikar", "carp", "bol", "karisik"];
      for (const category of categories) {
        await supabaseAdmin.from("minmat_scores").insert([
          {
            user_id: userId,
            category: category,
            high_score: 0,
            reward_score: 0,
          },
        ]);
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
