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

  const { data: rosters } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("*")
    .eq("user_id", userId);

  if (!rosters || rosters.length === 0) {
    console.log("No user rosters found");
    return;
  }

  // Collect all UUIDs in user's rosters
  const userUuids = new Set<string>();
  for (const r of rosters) {
    (r.starters || []).forEach((id: string) => userUuids.add(id));
    (r.bench || []).forEach((id: string) => userUuids.add(id));
  }

  const uuidList = Array.from(userUuids);
  console.log(`Checking ${uuidList.length} unique UUIDs from user rosters against team_rosters...`);

  const { data: matchingPlayers, error } = await supabaseAdmin
    .from("team_rosters")
    .select("id, player_name, team_id")
    .in("id", uuidList);

  if (error) {
    console.error("Error checking database:", error);
    return;
  }

  console.log(`Found ${matchingPlayers?.length || 0} matches out of ${uuidList.length} in team_rosters.`);
  if (matchingPlayers && matchingPlayers.length > 0) {
    console.log("Matching players samples:", matchingPlayers.slice(0, 5));
  }

  // Let's print out the player names that are missing in team_rosters but wait,
  // we can't find their names directly from the orphaned UUIDs.
  // But wait! Is there a player_stage_stats or another table where the old UUIDs might still have names?
  // Let's check if player_stage_stats or fantasy_duels or another table has those UUIDs!
  console.log("\nChecking if these UUIDs exist in player_stage_stats...");
  const { data: statsMatches } = await supabaseAdmin
    .from("player_stage_stats")
    .select("player_id, player_name")
    .in("player_id", uuidList);

  console.log(`Found ${statsMatches?.length || 0} matches in player_stage_stats.`);
  if (statsMatches && statsMatches.length > 0) {
    console.log("Stats matches samples:", statsMatches.slice(0, 10));
  }
}

main().catch(console.error);
