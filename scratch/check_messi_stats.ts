import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from "path";

// Parse environment variables manually
const workspaceDir = path.join(__dirname, '..');
let envText = '';
if (fs.existsSync(path.join(workspaceDir, '.env.local'))) envText += fs.readFileSync(path.join(workspaceDir, '.env.local'), 'utf8') + '\n';
if (fs.existsSync(path.join(workspaceDir, '.env'))) envText += fs.readFileSync(path.join(workspaceDir, '.env'), 'utf8') + '\n';

const lines = envText.split(/\r?\n/);
const getEnv = (key: string) => {
  const line = lines.find(l => l.trim().startsWith(key + '='));
  if (!line) return '';
  const val = line.substring(line.indexOf('=') + 1).trim();
  return val.replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // Find Messi in team_rosters
  const { data: player, error: pErr } = await supabase
    .from('team_rosters')
    .select('id, player_name, team_id')
    .ilike('player_name', '%Messi%')
    .single();
    
  if (pErr || !player) {
    console.error("Messi not found in team_rosters:", pErr);
    return;
  }
  
  console.log(`Found Messi: ID=${player.id}, Name=${player.player_name}, Team=${player.team_id}`);
  
  // Fetch stats for all stages
  const { data: stats, error: sErr } = await supabase
    .from('player_stage_stats')
    .select('*')
    .eq('player_id', player.id);
    
  if (sErr) {
    console.error("Error fetching Messi stage stats:", sErr);
    return;
  }
  
  console.log("\nMessi Stage Stats:");
  stats.forEach(s => {
    console.log(`Stage: ${s.stage} - Goals: ${s.goals}, Assists: ${s.assists}, Points: ${s.points}, Mins: ${s.minutes_played}`);
  });
}

run();
