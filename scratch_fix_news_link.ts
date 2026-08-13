import { supabaseAdmin } from "./lib/supabase";

async function run() {
  console.log("Statmatik haberi güncelleniyor...");

  const { error } = await supabaseAdmin
    .from("news")
    .update({ link: null })
    .eq("category", "Statmatik");

  if (error) {
    console.error("Hata:", error);
  } else {
    console.log("Başarıyla güncellendi! Artık duyuru olarak görünecek ve tıklanamayacak.");
  }
}

run().catch(console.error);
