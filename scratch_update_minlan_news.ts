import { supabaseAdmin } from "./lib/supabase";

async function run() {
  console.log("Minlan haberi güncelleniyor...");

  const newTitle = "Minlan Bugün 19:03'te Yayında: 9 Dilde Karşılıklı Mücadele Başlıyor!";
  const newSnippet = "Oyunla eğitim ekosistemimiz Statmatik'in en yeni üyesi Minlan, bugün saat 19:03'te kullanıma açılıyor. Artık oyuncular 9 farklı dilde, çapraz ödül sistemiyle karşılıklı kelime ve dil yeteneklerini yarıştırabilecekler.";

  const { data, error } = await supabaseAdmin
    .from("news")
    .update({ 
      title: newTitle,
      snippet: newSnippet 
    })
    .eq("link", "https://statmatik.com/minlan-19-mart")
    .select();

  if (error) {
    console.error("Hata:", error.message);
  } else {
    console.log("Haber başarıyla güncellendi!", data);
  }
}

run().catch(console.error);
