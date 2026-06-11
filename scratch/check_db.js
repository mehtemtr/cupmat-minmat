const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse environment variables manually
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

let supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
let supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

// Self-healing fallback if URL is placeholder or supabase.com
if (!supabaseUrl || supabaseUrl === 'https://supabase.com' || !supabaseUrl.includes('.supabase.co')) {
  if (supabaseServiceKey && supabaseServiceKey.includes('.')) {
    try {
      const parts = supabaseServiceKey.split('.');
      if (parts.length === 3) {
        const payload = Buffer.from(parts[1], 'base64').toString('utf8');
        const claims = JSON.parse(payload);
        if (claims && claims.ref) {
          supabaseUrl = `https://${claims.ref}.supabase.co`;
          console.log(`[Auto-Recovery] Constructed URL from JWT: ${supabaseUrl}`);
        }
      }
    } catch (e) {
      console.error("[Auto-Recovery] Failed to parse JWT payload:", e);
    }
  }
}

// Fallback to hardcoded project ref if all else fails
if (!supabaseUrl || supabaseUrl === 'https://supabase.com') {
  supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
}

console.log("Connecting to:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // Check rosters
  const { data: rosters, error: rErr } = await supabase
    .from('fantasy_rosters')
    .select('id, user_id, team_name, stage, starters, bench, manager_id')
    .eq('stage', 'matchday_1');
  
  if (rErr) {
    console.error("Error fetching rosters:", rErr);
  } else {
    console.log(`Found ${rosters.length} rosters for matchday_1:`);
    rosters.forEach(r => console.log(` - Roster: ${r.id}, User: ${r.user_id}, Team: ${r.team_name}, Starters count: ${r.starters ? r.starters.length : 0}`));
  }

  // Check duels
  const { data: duels, error: dErr } = await supabase
    .from('fantasy_duels')
    .select('*')
    .eq('stage', 'matchday_1');

  if (dErr) {
    console.error("Error fetching duels:", dErr);
  } else {
    console.log(`Found ${duels.length} duels for matchday_1:`);
    duels.forEach(d => console.log(` - Duel: ${d.id}, roster1: ${d.roster_id_1} (score: ${d.score_1}), roster2: ${d.roster_id_2} (score: ${d.score_2}), result: ${d.result}`));
  }

  // Check standings
  const { data: standings, error: sErr } = await supabase
    .from('fantasy_duel_standings')
    .select('*');

  if (sErr) {
    console.error("Error fetching standings:", sErr);
  } else {
    console.log(`Found ${standings.length} standings entries:`);
    standings.forEach(s => console.log(` - User: ${s.user_id}, Nickname: ${s.nickname}, Won: ${s.won}, Lost: ${s.lost}, Points: ${s.points}, Roster Pts: ${s.total_roster_points}`));
  }

  // Check active stage in redis or local status if any
}

run();
