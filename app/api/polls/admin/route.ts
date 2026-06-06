import { NextResponse } from "next/server";
import { verifyAdminSecret } from "@/lib/auth/api-auth";
import { supabaseAdmin } from "@/lib/supabase";

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

    const newPoll = {
      question_tr,
      question_en,
      question_es: question_es || null,
      question_fr: question_fr || null,
      question_de: question_de || null,
      question_pt: question_pt || null,
      question_it: question_it || null,
      question_ko: question_ko || null,
      question_ar: question_ar || null,
      options,
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
