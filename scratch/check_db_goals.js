const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = __dirname + '/..';
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
    const allStats = [];
    let from = 0;
    let to = 999;
    let hasMore = true;
    while (hasMore) {
      const { data: chunk, error } = await supabase
        .from('player_stage_stats')
        .select('player_id, stage, goals, team_rosters(player_name, team_id)')
        .range(from, to);
        
      if (error) {
        console.error("Error:", error);
        return;
      }
      if (chunk && chunk.length > 0) {
        allStats.push(...chunk);
        if (chunk.length < 1000) hasMore = false;
        else { from += 1000; to += 1000; }
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Total stats in DB (paginated): ${allStats.length}`);
    const goalsMap = {};
    allStats.forEach(s => {
      const roster = s.team_rosters;
      if (!roster) return;
      const name = roster.player_name;
      if (!goalsMap[name]) {
        goalsMap[name] = { id: s.player_id, team: roster.team_id, goals: 0 };
      }
      goalsMap[name].goals += s.goals || 0;
    });
    
    const sorted = Object.entries(goalsMap).sort((a, b) => b[1].goals - a[1].goals);
    console.log("Top 15 Scorers in DB:");
    sorted.slice(0, 15).forEach(([name, data]) => {
      console.log(`- ${name} (${data.team}): ${data.goals} goals`);
    });
  } catch (err) {
    console.error("Failed running test:", err);
  }
}

run();
