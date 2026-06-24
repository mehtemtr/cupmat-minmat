const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { generateGroupFixtures } = require('../lib/fixtures');
const { generateSimulation } = require('../lib/simulation');

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

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const fixtures = generateGroupFixtures();
  const targetMatches = fixtures.filter(m => m.homeTeamId === 'fra' || m.awayTeamId === 'fra' || m.homeTeamId === 'arg' || m.awayTeamId === 'arg');
  
  console.log(`Found ${targetMatches.length} matches for France or Argentina.`);

  for (const match of targetMatches) {
    const { data: homePlayers } = await supabase
      .from('team_rosters')
      .select('*')
      .eq('team_id', match.homeTeamId);

    const { data: awayPlayers } = await supabase
      .from('team_rosters')
      .select('*')
      .eq('team_id', match.awayTeamId);

    const events = generateSimulation(match, homePlayers, awayPlayers);
    const scoreEvents = events.filter(e => e.type === 'goal' && !e.textTr.includes("kendi kalesine"));
    
    console.log(`\nMatch ${match.id} (${match.date}): ${match.homeTeamId} vs ${match.awayTeamId}`);
    if (scoreEvents.length === 0) {
      console.log("  No goals scored.");
    } else {
      scoreEvents.forEach(ev => {
        const scorerName = ev.textTr.split("Golü atan oyuncu: ")[1]?.split(",")[0]?.replace("!", "")?.trim() || "";
        const assistName = ev.textTr.split("Asisti yapan oyuncu: ")[1]?.replace("!", "")?.trim() || "";
        console.log(`  - Goal: Scorer: "${scorerName}"${assistName ? `, Assist: "${assistName}"` : ""}`);
      });
    }
  }
}

run();
