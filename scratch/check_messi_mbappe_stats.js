const fs = require('fs');
const path = require('path');
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
  const { data: players, error: pErr } = await supabase
    .from('team_rosters')
    .select('id, player_name, team_id')
    .or('player_name.ilike.%messi%,player_name.ilike.%mbapp%');

  if (pErr) {
    console.error("Error fetching players:", pErr);
    return;
  }

  console.log("Matching Players in team_rosters:", players);

  if (players && players.length > 0) {
    const playerIds = players.map(p => p.id);
    const { data: stats, error: sErr } = await supabase
      .from('player_stage_stats')
      .select('*')
      .in('player_id', playerIds);

    if (sErr) {
      console.error("Error fetching stats:", sErr);
      return;
    }

    console.log("\nStats in player_stage_stats:");
    stats.forEach(s => {
      const p = players.find(x => x.id === s.player_id);
      console.log(`- ${p.player_name} (${p.team_id}) [${s.stage}] - Goals: ${s.goals}, Assists: ${s.assists}, Points: ${s.points}, Minutes: ${s.minutes_played}`);
    });
  }
}

run();
