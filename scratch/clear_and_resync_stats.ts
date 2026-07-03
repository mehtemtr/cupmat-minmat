import { supabaseAdmin } from "../lib/supabase";
import { runPlayerStatsSync } from "../lib/stats/sync";

async function main() {
  console.log("=== CLEANSING STATS DATABASE ===");
  
  // 1. Delete all rows from player_stage_stats
  const { count, error: deleteErr } = await supabaseAdmin
    .from("player_stage_stats")
    .delete()
    .neq("stage", "nonexistent_stage_value_to_delete_all_rows");

  if (deleteErr) {
    console.error("Error deleting old stats:", deleteErr);
    process.exit(1);
  }
  console.log("Successfully wiped out old player_stage_stats.");

  // 2. Run fresh sync with name-first matching priority
  console.log("Running fresh synchronization with name-first priority...");
  const result = await runPlayerStatsSync();
  console.log("Sync completed successfully:", result);
}

main().catch((err) => {
  console.error("Unhanlded error during cleansing/sync:", err);
});
