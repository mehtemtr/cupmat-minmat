const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
let supabaseKey = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
  if (keyMatch) supabaseKey = keyMatch[1].trim().replace(/['"]/g, "");
}

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("--- Checking ai_agent_logs ---");
  const { data: logs, error: logError } = await supabase
    .from("ai_agent_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  if (logError) {
    console.error("Error reading ai_agent_logs:", logError);
  } else {
    console.log(`Found ${logs.length} recent log entries:`);
    logs.forEach((log) => {
      console.log(`- Time: ${log.started_at} | Agent: ${log.agent_name} | Task: ${log.task_type} | Status: ${log.status} | Processed: ${log.items_processed} | Error: ${log.error_message || "None"}`);
    });
  }

  console.log("\n--- Checking team_rosters count ---");
  const { count, error: rosterError } = await supabase
    .from("team_rosters")
    .select("*", { count: "exact", head: true });

  if (rosterError) {
    console.error("Error counting team_rosters:", rosterError);
  } else {
    console.log(`Total players inside 'team_rosters' table: ${count}`);
  }

  if (count > 0) {
    console.log("\n--- Sample players inside team_rosters ---");
    const { data: players, error: sampleError } = await supabase
      .from("team_rosters")
      .select("*")
      .limit(5);

    if (sampleError) {
      console.error("Error reading sample players:", sampleError);
    } else {
      players.forEach((p) => {
        console.log(`- Team: ${p.team_id} | Name: ${p.player_name} | Pos: ${p.player_position} | Club: ${p.club}`);
      });
    }
  }
}

run();
