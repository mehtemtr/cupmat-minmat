import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Örnek kullanıcı profilleri oluştur
    const sampleProfiles = [
      { id: "user_test_1", nickname: "Kartal1923" },
      { id: "user_test_2", nickname: "KupaKartalı" },
      { id: "user_test_3", nickname: "AslanEğiticisi" },
    ];

    for (const profile of sampleProfiles) {
      await supabaseAdmin
        .from("profiles")
        .upsert(profile, { onConflict: "id" });
    }

    // 2. Örnek MinMat skorları ekle
    const sampleScores = [
      { user_id: "user_test_1", category: "topla", high_score: 245, reward_score: 245 },
      { user_id: "user_test_1", category: "cikar", high_score: 189, reward_score: 189 },
      { user_id: "user_test_2", category: "karisik", high_score: 320, reward_score: 320 },
      { user_id: "user_test_3", category: "carp", high_score: 156, reward_score: 156 },
      { user_id: "user_test_2", category: "topla", high_score: 278, reward_score: 278 },
    ];

    for (const score of sampleScores) {
      await supabaseAdmin
        .from("minmat_leaderboard")
        .upsert({
          ...score,
          nickname: sampleProfiles.find(p => p.id === score.user_id)?.nickname || "Kullanıcı",
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id,category" });
    }

    // 3. Örnek CupMat aktiviteleri ekle (gamification)
    const sampleActivities = [
      {
        user_id: "user_test_1", display_name: "AslanKral1923", mevcutPeriyotPuani: 45 },
      {
        user_id: "user_test_2", display_name: "FutbolSever2026", mevcutPeriyotPuani: 38 },
      {
        user_id: "user_test_3", display_name: "KupaAslanı", mevcutPeriyotPuani: 32 },
    ];

    // Not: Gamification store zaten kendi yönetimini yapıyor, ama örnek olarak minmat_scores yeterli

    return NextResponse.json({
      success: true,
      message: "Örnek veriler başarıyla eklendi!",
      profilesAdded: sampleProfiles.length,
      scoresAdded: sampleScores.length
    });

  } catch (error) {
    console.error("Test verisi ekleme hatası:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Bilinmeyen hata" 
    }, { status: 500 });
  }
}
