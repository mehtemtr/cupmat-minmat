import { supabaseAdmin } from "./lib/supabase";

async function run() {
  const { data, error } = await supabaseAdmin
    .from("news")
    .update({ link: "/minlan" })
    .eq("title", "Minlan Bugün 19:03'te Yayında: 9 Dilde Karşılıklı Mücadele Başlıyor!")
    .select();
  console.log(data, error);
}
run();
