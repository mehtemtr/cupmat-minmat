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

const normalizeName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, "")
    .trim();
};

async function run() {
  try {
    const { data: players, error } = await supabase
      .from('team_rosters')
      .select('player_name, team_id')
      .eq('team_id', 'mex');
      
    console.log("Normalized DB Names for Mexico:");
    players.forEach(p => {
      console.log(`- Original: "${p.player_name}", Normalized: "${normalizeName(p.player_name)}"`);
    });
    
    console.log("\nNormalize test for Raul Jimenez:");
    console.log(`- Excel: "Raúl Jiménez" -> "${normalizeName("Raúl Jiménez")}"`);
    console.log(`- Matches exact? ${normalizeName("Raúl Jiménez") === normalizeName("Raúl Jiménez")}`);
  } catch (err) {
    console.error("Failed running test:", err);
  }
}

run();
