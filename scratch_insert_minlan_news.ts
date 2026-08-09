import { supabaseAdmin } from "./lib/supabase";

async function run() {
  console.log("Minlan haberi veritabanına ekleniyor...");

  // Türkiye için country_id'yi bul
  const { data: countryData } = await supabaseAdmin
    .from("countries")
    .select("id")
    .eq("iso2", "TR")
    .single();

  const country_id = countryData ? countryData.id : null;

  const newsItem = {
    title: "Minlan Çok Yakında Yayında: 9 Dilde Karşılıklı Mücadele Başlıyor!",
    snippet: "Oyunla eğitim ekosistemimiz Statmatik'in en yeni üyesi Minlan, 19 Mart'ta (19.03) kullanıma açılıyor. Artık oyuncular 9 farklı dilde, çapraz ödül sistemiyle karşılıklı kelime ve dil yeteneklerini yarıştırabilecekler.",
    source: "StatMatik",
    category: "Statmatik",
    link: "https://statmatik.com/minlan-19-mart", // Benzersiz link
    published_at: new Date().toISOString(),
    featured_order: 1, // En üstte çıkması için (Pin)
    country_id: country_id
  };

  const { data, error } = await supabaseAdmin
    .from("news")
    .upsert([newsItem], { onConflict: "link" })
    .select("id");

  if (error) {
    console.error("Hata:", error.message);
  } else {
    console.log("Haber başarıyla eklendi!", data);
  }
}

run().catch(console.error);
