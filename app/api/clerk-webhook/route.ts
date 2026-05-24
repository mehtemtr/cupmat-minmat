import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

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
      const { id, username, first_name, last_name, email_addresses } = evt.data;
      
      console.log("Kullanıcı verisi:", { id, username, first_name, last_name });
      
      return NextResponse.json({ 
        success: true, 
        message: "Kullanıcı senkronize edildi",
        user: { id, username, first_name, last_name }
      });
    }

    return NextResponse.json({ success: true, message: "Olay kabul edildi" });

  } catch (error) {
    console.error("Webhook hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
