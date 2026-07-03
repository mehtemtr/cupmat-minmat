import { supabaseAdmin } from "../lib/supabase";

async function main() {
  const { data: tur20 } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .eq("team_id", "tur")
    .eq("player_number", 20);
  console.log("Turkey No 20 in DB:", tur20);

  const { data: tur8 } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .eq("team_id", "tur")
    .eq("player_number", 8);
  console.log("Turkey No 8 in DB:", tur8);

  const { data: arg10 } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .eq("team_id", "arg")
    .eq("player_number", 10);
  console.log("Argentina No 10 in DB:", arg10);

  const { data: arg21 } = await supabaseAdmin
    .from("team_rosters")
    .select("*")
    .eq("team_id", "arg")
    .eq("player_number", 21);
  console.log("Argentina No 21 in DB:", arg21);
}

main();
