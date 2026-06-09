const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    envVars[key] = value.trim();
  }
});

const supabaseUrl = "https://ewdfexbuhgtsnsxveobc.supabase.co";
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const stage = "matchday_1";

  // Simulate GET logic:
  // 1. Fetch rosters
  const { data: allStageRosters } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("team_name, user_id, formation")
    .eq("stage", stage);

  console.log(`Found ${allStageRosters ? allStageRosters.length : 0} rosters in DB.`);

  let registeredTeams = [];
  if (allStageRosters && allStageRosters.length > 0) {
    const uIds = allStageRosters.map((r) => r.user_id).filter(Boolean);
    let nickMap = {};

    if (uIds.length > 0) {
      // Corrected query using user_id
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, nickname")
        .in("user_id", uIds);

      if (profiles) {
        profiles.forEach((p) => {
          nickMap[p.user_id] = p.nickname || "Katılımcı";
        });
      }
    }

    registeredTeams = allStageRosters.map((r) => ({
      teamName: r.team_name,
      nickname: r.user_id ? nickMap[r.user_id] || "Katılımcı" : "Statmatik Bot",
      formation: r.formation,
    }));
  }

  console.log("Registered Teams List:");
  console.log(JSON.stringify(registeredTeams, null, 2));
}

main();
