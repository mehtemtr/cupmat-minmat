const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.resolve(__dirname, '..');
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

async function dropTables() {
  const sql = `
DROP TABLE IF EXISTS public.fantasy_duel_standings CASCADE;
DROP TABLE IF EXISTS public.fantasy_duels CASCADE;
DROP TABLE IF EXISTS public.fantasy_rosters CASCADE;
DROP TABLE IF EXISTS public.manager_stage_stats CASCADE;
DROP TABLE IF EXISTS public.match_analyses CASCADE;
DROP TABLE IF EXISTS public.match_weather CASCADE;
DROP TABLE IF EXISTS public.player_stage_stats CASCADE;
DROP TABLE IF EXISTS public.player_status CASCADE;
DROP TABLE IF EXISTS public.private_league_members CASCADE;
DROP TABLE IF EXISTS public.private_leagues CASCADE;
DROP TABLE IF EXISTS public.polls CASCADE;
DROP TABLE IF EXISTS public.poll_votes CASCADE;
`;

  try {
    // Try via rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    console.log("RPC exec_sql:", { data, error });
  } catch (err) {
    console.error("RPC error:", err);
  }
}

dropTables();
