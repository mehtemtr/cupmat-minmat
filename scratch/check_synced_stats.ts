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
  const stage = process.argv[2] || "matchday_1";
  console.log(`Checking player stats in DB for stage ${stage}:`);
  
  const { data: stats, error } = await supabase
    .from('player_stage_stats')
    .select('player_id, goals, assists, yellow_cards, red_cards, points, minutes_played')
    .eq('stage', stage);
    
  if (error) {
    console.error("Error fetching stats:", error);
    return;
  }
  
  console.log(`Found ${stats.length} records in player_stage_stats for ${stage}.`);
  
  // Fetch paged team rosters to get names
  const dbRosters = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from('team_rosters')
      .select('id, player_name, team_id')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) break;
    if (!data || data.length === 0) break;
    dbRosters.push(...data);
    if (data.length < 1000) break;
    page++;
  }
    
  const rosterMap = new Map(dbRosters.map(r => [r.id, r]));
  
  // Sort stats by points descending and print top 15
  const sortedStats = stats
    .map(s => ({
      ...s,
      playerName: rosterMap.get(s.player_id)?.player_name || `Unknown (${s.player_id})`,
      teamId: rosterMap.get(s.player_id)?.team_id || '??'
    }))
    .sort((a, b) => b.points - a.points);
    
  console.log(`\nTop 15 players by points on ${stage}:`);
  sortedStats.slice(0, 15).forEach(s => {
    console.log(`${s.playerName} (${s.teamId.toUpperCase()}) - Points: ${s.points}, Mins: ${s.minutes_played}, G: ${s.goals}, A: ${s.assists}, Y: ${s.yellow_cards}, R: ${s.red_cards}`);
  });
}

run();
