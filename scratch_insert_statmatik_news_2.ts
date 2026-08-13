import { supabaseAdmin } from "./lib/supabase";

async function run() {
  console.log("Statmatik haberi ekleniyor...");

  // Get country ID for Turkey
  const { data: countries, error: countryError } = await supabaseAdmin
    .from("countries")
    .select("id")
    .eq("iso2", "TR")
    .limit(1);

  if (countryError || !countries || countries.length === 0) {
    console.error("Türkiye ülke ID'si bulunamadı:", countryError);
    return;
  }

  const countryId = countries[0].id;

  const newsData = {
    country_id: countryId,
    category: "Statmatik",
    title: "StatMatik Yeni Haliyle ve Sürekli Yenilenerek Büyümeye Devam Ediyor!",
    link: "https://statmatik.com/guncelleme-duyurusu-" + Date.now(), // Unique link
    source: "Statmatik Geliştirici Ekibi",
    snippet: "Platformumuz StatMatik; CupMat ve MinMat gibi sevilen özelliklerinin yanına yeni eklenen modüllerle daha da güçlendi. Yepyeni bir arayüz, gelişmiş özellikler ve kesintisiz yeniliklerle sizlere en iyi deneyimi sunmak için sürekli büyümeye devam ediyoruz.",
    published_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabaseAdmin
    .from("news")
    .insert(newsData);

  if (insertError) {
    console.error("Haber eklenirken hata oluştu:", insertError);
  } else {
    console.log("Statmatik haberi başarıyla eklendi!");
  }
}

run().catch(console.error);
