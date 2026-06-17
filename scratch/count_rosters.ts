import { supabaseAdmin } from "../lib/supabase";

async function main() {
  const { data: rosters, error } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("id, user_id, stage, team_name");

  if (error) {
    console.error("Error fetching rosters:", error);
    return;
  }

  console.log(`Total rosters in database: ${rosters.length}`);

  const countsByStage: Record<string, { real: number; bots: number; realTeams: string[] }> = {};

  for (const r of rosters) {
    const stage = r.stage || "unknown";
    if (!countsByStage[stage]) {
      countsByStage[stage] = { real: 0, bots: 0, realTeams: [] };
    }

    const isBot = r.user_id.startsWith("bot_") || r.user_id === "statmatik_bot";
    if (isBot) {
      countsByStage[stage].bots++;
    } else {
      countsByStage[stage].real++;
      countsByStage[stage].realTeams.push(r.team_name || r.id);
    }
  }

  console.log("\nRosters Breakdown by Stage:");
  console.log("==========================================");
  for (const [stage, data] of Object.entries(countsByStage)) {
    console.log(`Stage: ${stage}`);
    console.log(`  Real Users: ${data.real} (${data.realTeams.join(", ") || "None"})`);
    console.log(`  Bots: ${data.bots}`);
  }
}

main().catch(console.error);
