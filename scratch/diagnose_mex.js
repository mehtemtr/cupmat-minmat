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
  if (!name) return "";
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
    const { data: dbPlayers } = await supabase
      .from("team_rosters")
      .select("*");
      
    console.log(`Loaded ${dbPlayers.length} players from DB.`);
    
    // Simulate matching for Mexico row: Raúl Jiménez
    const teamId = "mex";
    const rowPlayerName = "Raúl Jiménez";
    const cleanExcelName = normalizeName(rowPlayerName);
    
    const teamPlayers = dbPlayers.filter((p) => p.team_id.toLowerCase() === teamId);
    console.log(`Found ${teamPlayers.length} players in team_id = '${teamId}'`);
    
    // Check exact name match
    let player = teamPlayers.find((p) => normalizeName(p.player_name) === cleanExcelName);
    console.log(`Exact match result for '${rowPlayerName}':`, player ? player.player_name : "NOT FOUND");
    
    // If not found, list all normalized names in teamPlayers
    if (!player) {
      console.log("All normalized names in teamPlayers:");
      teamPlayers.forEach(p => {
        console.log(`  - DB: "${p.player_name}" -> "${normalizeName(p.player_name)}" vs Excel: "${cleanExcelName}"`);
      });
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
