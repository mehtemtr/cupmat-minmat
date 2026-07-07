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
    const { data: dbPlayers } = await supabase.from("team_rosters").select("*");
    const parsedData = JSON.parse(fs.readFileSync("scratch/parsed_excel_stats.json", "utf8"));
    const stage = "round_of_16";
    const playersStats = parsedData[stage] || [];
    
    console.log(`Loaded ${dbPlayers.length} players from DB, ${playersStats.length} stats from JSON.`);
    
    const targets = ["Kylian Mbappé", "Ousmane Dembélé"];
    
    playersStats.forEach(row => {
      if (targets.some(t => row.player_name.includes(t) || t.includes(row.player_name))) {
        console.log(`\nAnalyzing row in JSON: "${row.player_name}" (team: ${row.team_name}, jersey: ${row.jersey_number})`);
        
        const teamId = "fra";
        const teamPlayers = dbPlayers.filter((p) => p.team_id.toLowerCase() === teamId);
        console.log(`- Filtered teamPlayers count for '${teamId}': ${teamPlayers.length}`);
        
        const cleanExcelName = normalizeName(row.player_name);
        const cleanExcelShort = normalizeName(row.player_short);
        
        let player = teamPlayers.find((p) => normalizeName(p.player_name) === cleanExcelName);
        console.log(`- Step 1 (Exact): ${player ? player.player_name : "null"}`);
        
        if (!player) {
          player = teamPlayers.find((p) => {
            const cleanDbName = normalizeName(p.player_name);
            return cleanDbName.includes(cleanExcelName) || cleanExcelName.includes(cleanDbName);
          });
          console.log(`- Step 2 (Substring): ${player ? player.player_name : "null"}`);
        }
        
        if (!player && cleanExcelShort) {
          player = teamPlayers.find((p) => {
            const cleanDbName = normalizeName(p.player_name);
            return cleanDbName.includes(cleanExcelShort) || cleanExcelShort.includes(cleanDbName);
          });
          console.log(`- Step 3 (Short name): ${player ? player.player_name : "null"}`);
        }
        
        if (!player) {
          console.log(`- NOT MATCHED AT ALL!`);
        }
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
