import { supabaseAdmin } from "../lib/supabase";

async function main() {
  const uuid = "245a1044-7309-4542-b987-ff3a71921213";
  const { data, error } = await supabaseAdmin
    .from("team_rosters")
    .select("id, player_name, team_id")
    .eq("id", uuid)
    .maybeSingle();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Player found for UUID:", data);
}

main().catch(console.error);
