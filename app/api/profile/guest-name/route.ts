import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get("lang") || "tr";
    
    // Dillere göre "Kartal" çevirileri
    const prefixMap: Record<string, string> = {
      tr: "Kartal",
      en: "Eagle",
      de: "Adler",
      fr: "Aigle",
      es: "Aguila",
      pt: "Aguia",
      it: "Aquila",
      ar: "Nasr", // Arapça
      ko: "Doksuri" // Korece
    };
    
    const prefix = prefixMap[lang] || "Eagle";
    const key = `guest_counter:${prefix.toLowerCase()}`;

    // Redis INCR
    let currentNumber = await redis.incr(key);

    // Eğer sayaç ilk defa oluştuysa (1 döner), onu 1923'e atlat
    if (currentNumber === 1) {
      await redis.set(key, 1923);
      currentNumber = 1923;
    } else if (currentNumber < 1923) {
      // Bir ihtimal eski bir sayaç 1923'ün altındaysa toparla
      currentNumber = 1923 + currentNumber;
      await redis.set(key, currentNumber);
    }

    const guestName = `${prefix}${currentNumber}`;

    return NextResponse.json({ success: true, guestName });
  } catch (error) {
    console.error("Guest name error:", error);
    // Hata olursa rastgele bir tane verelim
    const randomFallback = Math.floor(Math.random() * 9000) + 1000;
    return NextResponse.json({ success: true, guestName: `Misafir${randomFallback}` });
  }
}
