import { supabaseAdmin } from "../lib/supabase";

async function main() {
  const { data: samples, error } = await supabaseAdmin
    .from("team_rosters")
    .select("id, player_name, team_id")
    .limit(5);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Samples from team_rosters:", samples);
}

main().catch(console.error);
