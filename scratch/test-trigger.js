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

const BOT_POOL = [
  {
    userId: "bot_user_tr_1",
    email: "kaan.y@cupmat.com",
    nickname: "KaanYalcin",
    teamName: "Boğazın Kaplanları",
    country: "tur",
    formation: "4-4-2"
  },
  {
    userId: "bot_user_tr_2",
    email: "serkan.k@cupmat.com",
    nickname: "Serkan Kartal",
    teamName: "Kadıköy Rüzgarı",
    country: "tur",
    formation: "4-3-3"
  }
];

async function main() {
  const stage = "matchday_1";
  
  // 1. Fetch current rosters
  const { data: rosters } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("id, user_id, team_name")
    .eq("stage", stage);

  const existingBots = (rosters || []).filter(
    (r) => r.user_id && r.user_id.startsWith("bot_")
  );
  const existingBotIds = new Set(existingBots.map((r) => r.user_id));

  console.log("Current existing bots count:", existingBots.length);

  // Load all players
  const { data: allPlayers } = await supabaseAdmin
    .from("team_rosters")
    .select("id, player_position, team_id");

  // Pick first bot (Boğazın Kaplanları)
  const bot = BOT_POOL[0];
  if (!existingBotIds.has(bot.userId)) {
    console.log(`Registering bot: ${bot.teamName}`);

    // Ensure profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, nickname")
      .eq("user_id", bot.userId)
      .maybeSingle();

    if (existingProfile) {
      console.log(`Profile already exists: ${existingProfile.nickname}`);
      if (existingProfile.nickname !== bot.nickname) {
        console.log(`Updating nickname to: ${bot.nickname}`);
        await supabaseAdmin
          .from("profiles")
          .update({ nickname: bot.nickname })
          .eq("user_id", bot.userId);
      }
    } else {
      console.log(`Creating new profile: ${bot.nickname}`);
      const { error: profError } = await supabaseAdmin
        .from("profiles")
        .insert({
          user_id: bot.userId,
          email: bot.email,
          nickname: bot.nickname,
        });
      if (profError) console.error("Profile insert error:", profError);
    }

    // Starters selection (pick 11 players from allPlayers)
    const starters = allPlayers.slice(0, 11).map(p => p.id);

    // Insert Roster
    const { error: rosterError } = await supabaseAdmin.from("fantasy_rosters").upsert(
      {
        user_id: bot.userId,
        team_name: bot.teamName,
        stage,
        formation: bot.formation,
        starters,
        bench: [],
        manager_id: bot.country,
        points: 0,
        team_index: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, stage, team_index" }
    );
    if (rosterError) console.error("Roster upsert error:", rosterError);
  }

  // Verification join query
  console.log("\nVerifying joined nickname resolution...");
  const { data: allStageRosters } = await supabaseAdmin
    .from("fantasy_rosters")
    .select("team_name, user_id, formation")
    .eq("stage", stage);

  if (allStageRosters) {
    const uIds = allStageRosters.map((r) => r.user_id).filter(Boolean);
    let nickMap = {};

    if (uIds.length > 0) {
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

    const registeredTeams = allStageRosters.map((r) => ({
      teamName: r.team_name,
      nickname: r.user_id ? nickMap[r.user_id] || "Katılımcı" : "Statmatik Bot",
      formation: r.formation,
    }));
    console.log("Registered Teams:", JSON.stringify(registeredTeams, null, 2));
  }
}

main();
