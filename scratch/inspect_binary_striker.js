const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let envText = '';
if (fs.existsSync('.env.local')) envText += fs.readFileSync('.env.local', 'utf8') + '\n';
if (fs.existsSync('.env')) envText += fs.readFileSync('.env', 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: rosters, error } = await supabase
    .from('fantasy_rosters')
    .select('*')
    .eq('stage', 'matchday_2')
    .ilike('team_name', '%Binary Striker%');

  if (error) {
    console.error("Rosters Error:", error);
    return;
  }

  if (rosters && rosters.length > 0) {
    const r = rosters[0];
    console.log(`Roster ID: ${r.id} | Team Name: ${r.team_name} | Manager: ${r.manager_id}`);
    console.log("Raw starters in DB:", r.starters);
    
    // Fetch player positions and details
    const { data: players, error: pErr } = await supabase
      .from('team_rosters')
      .select('id, player_name, player_position, team_id')
      .in('id', r.starters);

    if (pErr) console.error("Players Error:", pErr);
    console.log("Players fetched count:", players?.length);

    // Fetch player stage stats for matchday_2
    const { data: stats, error: sErr } = await supabase
      .from('player_stage_stats')
      .select('*')
      .eq('stage', 'matchday_2')
      .in('player_id', r.starters);

    if (sErr) console.error("Stats Error:", sErr);
    console.log("Stats fetched count:", stats?.length);

    console.log(`\nStarters and their stats:`);
    if (players) {
      players.forEach(p => {
        const pStat = stats ? stats.find(s => s.player_id === p.id) : null;
        console.log(`- ${p.player_name} (${p.team_id}) | Pos: ${p.player_position} | Mins: ${pStat?.minutes_played || 0} | Goals: ${pStat?.goals || 0} | Assists: ${pStat?.assists || 0} | Yellows: ${pStat?.yellow_cards || 0} | Clean Sheet: ${pStat?.clean_sheet || false}`);
      });
    }
  } else {
    console.log("Binary Striker FC not found.");
  }
}

run();
