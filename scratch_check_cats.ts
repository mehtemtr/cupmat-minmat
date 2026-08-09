import { supabaseAdmin } from "./lib/supabase";

async function run() {
  const { data, error } = await supabaseAdmin.from("minlan_categories").select("*").limit(1);
  console.log("Categories:", data, error);
}
run();
