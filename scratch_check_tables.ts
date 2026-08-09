import { supabaseAdmin } from "./lib/supabase";

async function run() {
  const { data: minmatData, error: minmatErr } = await supabaseAdmin.from("minmat_leaderboard").select("*").limit(5);
  console.log("Minmat Leaderboard:", minmatData, minmatErr);
  
  const { data: minlanData, error: minlanErr } = await supabaseAdmin.from("minlan_user_progress").select("*").limit(5);
  console.log("Minlan Progress:", minlanData, minlanErr);
}
run();
