import { NextResponse } from "next/server";
import { verifyAdminSecret } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";

async function translateText(text: string, targetLang: string, sourceLang: string = "en"): Promise<string> {
  if (!text) return "";
  const query = text.trim();
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join("").trim();
    }
  } catch (err) {
    console.error(`Translation error to ${targetLang}:`, err);
  }
  return "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify admin secret
    if (!verifyAdminSecret(request, body)) {
      return NextResponse.json({ success: false, error: "Yetkisiz erişim" }, { status: 401 });
    }

    const {
      question_tr,
      question_en,
      question_es,
      question_fr,
      question_de,
      question_pt,
      question_it,
      question_ko,
      question_ar,
      options,
      correct_option_index,
      points_reward,
      active_until
    } = body;

    if (!question_tr || !question_en || !options || !Array.isArray(options)) {
      return NextResponse.json({ success: false, error: "Eksik parametreler" }, { status: 400 });
    }

    const TARGET_LANGUAGES = ["es", "fr", "de", "pt", "it", "ko", "ar"];

    // Auto-translate questions if they are missing
    const final_question_tr = question_tr;
    const final_question_en = question_en;
    const final_question_es = question_es || await translateText(question_en, "es") || null;
    const final_question_fr = question_fr || await translateText(question_en, "fr") || null;
    const final_question_de = question_de || await translateText(question_en, "de") || null;
    const final_question_pt = question_pt || await translateText(question_en, "pt") || null;
    const final_question_it = question_it || await translateText(question_en, "it") || null;
    const final_question_ko = question_ko || await translateText(question_en, "ko") || null;
    const final_question_ar = question_ar || await translateText(question_en, "ar") || null;

    // Auto-translate options if they are missing
    const final_options = [];
    for (const option of options) {
      const newOption = { ...option };
      const sourceText = option.en || option.tr;
      const sourceLang = option.en ? "en" : "tr";
      
      for (const lang of TARGET_LANGUAGES) {
        if (!newOption[lang] && sourceText) {
          newOption[lang] = await translateText(sourceText, lang, sourceLang) || sourceText;
        }
      }
      final_options.push(newOption);
    }

    const newPoll = {
      question_tr: final_question_tr,
      question_en: final_question_en,
      question_es: final_question_es,
      question_fr: final_question_fr,
      question_de: final_question_de,
      question_pt: final_question_pt,
      question_it: final_question_it,
      question_ko: final_question_ko,
      question_ar: final_question_ar,
      options: final_options,
      correct_option_index: typeof correct_option_index === "number" ? correct_option_index : -1,
      points_reward: typeof points_reward === "number" ? points_reward : 10,
      active_until: active_until ? new Date(active_until).toISOString() : null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from("polls")
      .insert(newPoll)
      .select("*")
      .single();

    if (error) {
      console.error("Error creating poll:", error);
      return NextResponse.json({ success: false, error: "Veritabanına kaydedilemedi" }, { status: 500 });
    }

    return NextResponse.json({ success: true, poll: data });

  } catch (error) {
    console.error("Poll admin POST error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
