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
  console.log("Fetching fixtures from DB...");
  const { data, error } = await supabase
    .from('matches') // or fixtures? Let's check matches first
    .select('*');
  
  if (error) {
    console.error("Matches error:", error);
    // try fetching from fixtures table
    const { data: fixData, error: fixErr } = await supabase.from('fixtures').select('*');
    console.log("Fixtures:", fixData, fixErr);
  } else {
    console.log("Matches count:", data.length);
    console.log("Matchday 1 matches in DB:");
    data.filter(m => m.stage === 'matchday_1' || m.id.startsWith('H')).forEach(m => {
      console.log(`ID: ${m.id} | Group: ${m.group} | Home: ${m.home_team_id || m.homeTeamId} | Away: ${m.away_team_id || m.awayTeamId} | Score: ${m.home_score} - ${m.away_score}`);
    });
  }
}
run();
