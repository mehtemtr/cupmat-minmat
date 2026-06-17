import { supabaseAdmin } from "../lib/supabase";

async function main() {
  const { data: users } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("user_id, team_name")
    .neq("user_id", "statmatik_bot");

  const userId = users?.find(u => !u.user_id.startsWith("bot_"))?.user_id;
  if (!userId) {
    console.log("No real user found");
    return;
  }

  const { data: rosters, error } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("id, team_index, stage, team_name, starters, bench")
    .eq("user_id", userId);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("User rosters in DB:");
  for (const r of rosters) {
    console.log(`Team ${r.team_index} for stage ${r.stage} (${r.team_name}):`);
    console.log(`  Starters (first 3):`, r.starters?.slice(0, 3));
    console.log(`  Bench:`, r.bench);
  }
}

main().catch(console.error);
