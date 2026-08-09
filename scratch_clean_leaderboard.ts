import { supabaseAdmin } from "./lib/supabase";

async function run() {
  const targetTime = new Date("2026-08-09T19:03:00+03:00").toISOString();
  console.log(`Deleting all Minmat leaderboard records updated/created before ${targetTime}`);

  const { data, error, count } = await supabaseAdmin
    .from("minmat_leaderboard")
    .delete({ count: 'exact' })
    .lt("created_at", targetTime);

  if (error) {
    console.error("Error deleting records:", error);
  } else {
    console.log(`Successfully deleted ${count} old records from the Minmat leaderboard.`);
  }
}
run();
