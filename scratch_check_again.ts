import { supabaseAdmin } from "./lib/supabase";

async function run() {
  const { data: minmat, error: minmatErr } = await supabaseAdmin.from("minmat_leaderboard").select("*").limit(5);
  console.log("Minmat (Any remaining?):", minmat, minmatErr);
  
  const { data: minlan, error: minlanErr } = await supabaseAdmin.from("minlan_user_progress").select("*").limit(5);
  console.log("Minlan progress:", minlan, minlanErr);
}
run();
