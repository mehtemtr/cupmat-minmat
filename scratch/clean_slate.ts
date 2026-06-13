import { supabaseAdmin } from "../lib/supabase";

async function run() {
  console.log("Cleaning slate: deleting old rosters, duels, and standings...");

  // 1. Delete all duels
  const { error: errDuels } = await supabaseAdmin
    .from("fantasy_duels")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows

  if (errDuels) {
    console.error("Error deleting duels:", errDuels);
  } else {
    console.log("Deleted all fantasy duels successfully.");
  }

  // 2. Delete all rosters
  const { error: errRosters } = await supabaseAdmin
    .from("fantasy_rosters")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows

  if (errRosters) {
    console.error("Error deleting rosters:", errRosters);
  } else {
    console.log("Deleted all fantasy rosters successfully.");
  }

  // 3. Delete standings
  const { error: errStandings } = await supabaseAdmin
    .from("fantasy_duel_standings")
    .delete()
    .neq("user_id", "none");

  if (errStandings) {
    console.error("Error deleting standings:", errStandings);
  } else {
    console.log("Deleted all fantasy standings successfully.");
  }

  console.log("Clean slate operation finished.");
}

run();
