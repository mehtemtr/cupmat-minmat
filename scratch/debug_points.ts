import { supabaseAdmin } from "../lib/supabase";
import { calculatePlayerPoints } from "../lib/fantasy/points";

async function run() {
  const { data: roster } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("*")
    .eq("team_name", "Liman Spor")
    .eq("stage", "matchday_1")
    .single();

  if (!roster) {
    console.log("Roster Liman Spor not found");
    return;
  }

  console.log("Roster details:", roster.id, roster.team_name, "Manager:", roster.manager_id);
  console.log("Starters:", roster.starters);

  if (roster.starters && roster.starters.length > 0) {
    const { data: players } = await supabaseAdmin
      .from("team_rosters")
      .select("id, player_name, player_position")
      .in("id", roster.starters);

    const { data: stats } = await supabaseAdmin
      .from("player_stage_stats")
      .select("*")
      .eq("stage", "matchday_1")
      .in("player_id", roster.starters);

    console.log(`Stats count: ${stats?.length || 0}`);

    let total = 0;
    players?.forEach(p => {
      const playerStats = stats?.find(s => s.player_id === p.id);
      const pts = calculatePlayerPoints(playerStats, p.player_position);
      console.log(`Player: ${p.player_name} (${p.player_position}) -> stats: ${playerStats ? JSON.stringify(playerStats) : 'none'} -> Points: ${pts}`);
      total += pts;
    });

    console.log("Calculated players total:", total);
  }
}

run();
