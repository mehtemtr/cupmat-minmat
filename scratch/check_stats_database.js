const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  try {
    const ohId = '0aa26f51-0b4e-42f7-a497-a25626b47486';
    
    console.log(`Checking stats for player_id: ${ohId} (Oh Hyeon-gyu)...`);
    const { data: stageStats, error } = await supabase
      .from('player_stage_stats')
      .select('*')
      .eq('player_id', ohId);

    if (error) {
      console.error("Error fetching stage stats:", error);
      return;
    }

    console.log(`\nFound ${stageStats.length} stage stats records:`);
    console.log("--------------------------------------------------");
    stageStats.forEach((s) => {
      console.log(`Stage: ${s.stage} | Goals: ${s.goals} | Assists: ${s.assists} | Min Played: ${s.minutes_played} | Yellow: ${s.yellow_cards} | Clean Sheet: ${s.clean_sheet}`);
    });
    console.log("--------------------------------------------------");

    console.log("\nLet's also see if there are ANY stage stats in the database with goals > 0...");
    const { data: scorers, error: scorerErr } = await supabase
      .from('player_stage_stats')
      .select('player_id, stage, goals')
      .gt('goals', 0)
      .limit(10);

    if (scorerErr) {
      console.error("Error fetching scorers:", scorerErr);
      return;
    }

    console.log(`Found ${scorers.length} sample records with goals > 0:`);
    for (const sc of scorers) {
      // Fetch player name
      const { data: p } = await supabase
        .from('team_rosters')
        .select('player_name, team_id')
        .eq('id', sc.player_id)
        .single();
      console.log(`Player: ${p ? p.player_name : 'unknown'} (${p ? p.team_id : ''}) | Stage: ${sc.stage} | Goals: ${sc.goals}`);
    }
  } catch (err) {
    console.error("Failed running script:", err);
  }
}

run();
