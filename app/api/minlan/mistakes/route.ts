import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import dataset from "@/lib/minlan/data/minlan_full_dataset.json";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wordId, nativeLang, targetLang } = body;

    if (!wordId || !nativeLang || !targetLang) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    // Resolve internal profile ID from Clerk Auth
    let internalUserId = null;
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", clerkUserId)
        .maybeSingle();
      if (profile) {
        internalUserId = profile.id;
      }
    }

    // If user is not logged in, resolve or assign the Misafir/guest profile
    if (!internalUserId) {
      const { data: guestProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", "guest")
        .maybeSingle();

      if (guestProfile) {
        internalUserId = guestProfile.id;
      } else {
        // Fallback: create guest profile if it doesn't exist yet
        const { data: newGuest } = await supabaseAdmin
          .from("profiles")
          .insert({
            user_id: "guest",
            nickname: "Misafir",
            email: "guest@statmatik.local"
          })
          .select("id")
          .maybeSingle();
        if (newGuest) {
          internalUserId = newGuest.id;
        }
      }
    }

    if (!internalUserId) {
      return NextResponse.json({ success: false, error: "Failed to resolve guest profile" }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from("minlan_mistakes")
      .insert({
        user_id: internalUserId,
        word_id: wordId,
        native_lang: nativeLang,
        target_lang: targetLang
      });

    if (error) {
      console.error("Mistake tracking error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/minlan/mistakes error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nativeLang = searchParams.get("native") || "tr";
    const targetLang = searchParams.get("target") || "en";
    const timeframe = searchParams.get("timeframe") || "3days";

    // Resolve internal profile ID
    let internalUserId = null;
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("user_id", clerkUserId)
        .maybeSingle();
      if (profile) {
        internalUserId = profile.id;
      }
    }

    if (!internalUserId) {
      return NextResponse.json({ success: true, mistakes: [] });
    }

    // Fetch mistakes
    let query = supabaseAdmin
      .from("minlan_mistakes")
      .select("word_id")
      .eq("user_id", internalUserId)
      .eq("native_lang", nativeLang)
      .eq("target_lang", targetLang);

    if (timeframe === "3days") {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      query = query.gte("created_at", threeDaysAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Group and count in memory
    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.word_id] = (counts[row.word_id] || 0) + 1;
    }

    // Sort by count descending
    const sortedWordIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 10);

    // Map to actual word objects from full dataset
    const mistakes = sortedWordIds.map(id => {
      const word = dataset.words.find(w => w.id === id);
      return {
        word_id: id,
        count: counts[id],
        native_word: word ? (word as any)[`lang_${nativeLang}`] : "Bilinmiyor",
        target_word: word ? (word as any)[`lang_${targetLang}`] : "Unknown"
      };
    });

    return NextResponse.json({ success: true, mistakes });
  } catch (err: any) {
    console.error("GET /api/minlan/mistakes error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
