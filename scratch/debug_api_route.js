const { getAllPlayers } = require('../data/teams');
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function clean(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function findBestPlayerMatch(apiName, dbPlayers) {
  const cleanApi = clean(apiName);
  if (!cleanApi) return null;

  // 1. Exact clean match
  let match = dbPlayers.find((p) => clean(p.player_name) === cleanApi);
  if (match) return match;

  // 2. Substring match
  match = dbPlayers.find(
    (p) =>
      clean(p.player_name).includes(cleanApi) ||
      cleanApi.includes(clean(p.player_name))
  );
  if (match) return match;

  return null;
}

async function run() {
  const playerId = "kor-p11";
  
  const allPlayers = getAllPlayers();
  console.log("allPlayers count:", allPlayers.length);
  const player = allPlayers.find((p) => p.id === playerId);
  console.log("Found player:", player);

  if (!player) return;

  const { data: dbPlayers, error: rosterError } = await supabase
    .from("team_rosters")
    .select("id, player_name, team_id, player_position")
    .eq("team_id", player.teamId);

  console.log("dbPlayers count:", dbPlayers ? dbPlayers.length : 0, "error:", rosterError);

  const matchedPlayer = findBestPlayerMatch(player.name, dbPlayers || []);
  console.log("matchedPlayer:", matchedPlayer);
}

run();
