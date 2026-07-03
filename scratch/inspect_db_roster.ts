import { supabaseAdmin } from "../lib/supabase";

async function main() {
  const { data: ferdi } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .ilike("player_name", "%Ferdi%");

  console.log("=== FERDI IN DB team_rosters ===");
  console.log(ferdi);

  const { data: messi } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .ilike("player_name", "%Messi%");

  console.log("\n=== MESSI IN DB team_rosters ===");
  console.log(messi);
}

main();
