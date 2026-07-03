import { supabaseAdmin } from "../lib/supabase";

async function main() {
  const { data: messi } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .ilike("player_name", "%Messi%")
    .single();

  if (!messi) {
    console.log("Messi not found in team_rosters");
    return;
  }

  console.log("Messi UUID:", messi.id);

  const { data: stats } = await supabaseAdmin
    .from("player_stage_stats")
    .select("*")
    .eq("player_id", messi.id);

  console.log("Messi stats in DB:", stats);
}

main();
