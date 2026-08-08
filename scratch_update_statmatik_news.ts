import { supabaseAdmin } from "./lib/supabase";

async function run() {
  console.log("Statmatik haberi güncelleniyor...");

  const newSnippet = "Küresel Analiz & Oyunla Eğitim Portalı, gelişmiş Newsglo altyapısı sayesinde artık sizin için en önemli ve öncelikli haberleri anlık, doğru ve yapay zeka destekli filtrelerle ayrıştırarak sunuyor.";
  const newLink = "https://statmatik.com"; // Yönlendirilecek adres

  const { data, error } = await supabaseAdmin
    .from("news")
    .update({ 
      snippet: newSnippet,
      link: newLink
    })
    .eq("title", "Newsglo ile Haber Akışı Yenilendi: Daha Hızlı, Daha Akıllı!");

  if (error) {
    console.error("Haber güncellenirken hata oluştu:", error);
  } else {
    console.log("Statmatik haberi başarıyla güncellendi!");
  }
}

run().catch(console.error);
