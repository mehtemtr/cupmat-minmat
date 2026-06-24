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
  const targetMatches = fixtures.filter(m => m.id === 'I-1' || m.id === 'J-1');
  
  console.log("Found matches:", targetMatches);

  for (const match of targetMatches) {
    const { data: homePlayers } = await supabase
      .from('team_rosters')
      .select('*')
      .eq('team_id', match.homeTeamId);

    if (homePlayers && homePlayers.length > 0) {
      console.log("Sample player structure:", homePlayers[0]);
    }

    const { data: awayPlayers } = await supabase
      .from('team_rosters')
      .select('*')
      .eq('team_id', match.awayTeamId);

    console.log(`\nMatch ${match.id}: ${match.homeTeamId} vs ${match.awayTeamId}`);
    const events = generateSimulation(match, homePlayers, awayPlayers);
    console.log("Events:");
    events.forEach(e => console.log(`  Min ${e.minute} - ${e.type}: ${e.textTr}`));

    // Process events like in syncSimulatedScores
    const statsMap = {};
    const initPlayerStats = (player) => {
      statsMap[player.id] = {
        player_name: player.player_name,
        goals: 0,
        minutes_played: 90
      };
    };

    homePlayers.forEach(initPlayerStats);
    awayPlayers.forEach(initPlayerStats);

    // Simple search for best match helper
    const findBestPlayerMatch = (name, playersList) => {
      if (!name) return null;
      return playersList.find(p => p.player_name.toLowerCase().includes(name.toLowerCase()));
    };

    events.forEach(ev => {
      if (ev.type === 'goal') {
        const isOwnGoal = ev.textTr.includes("kendi kalesine") || ev.textEn.includes("own goal");
        if (!isOwnGoal) {
          const scorerName = ev.textTr.split("Golü atan oyuncu: ")[1]?.split(",")[0]?.replace("!", "")?.trim() || "";
          console.log(`    Parsed Scorer Name: "${scorerName}"`);
          const scorer = findBestPlayerMatch(scorerName, [...homePlayers, ...awayPlayers]);
          if (scorer) {
            statsMap[scorer.id].goals++;
            console.log(`    Goal matched to: ${scorer.player_name}`);
          } else {
            console.log(`    Goal Scorer "${scorerName}" NOT matched in rosters!`);
          }
        }
      }
    });

    console.log("Scorers with goals > 0:");
    Object.values(statsMap).forEach(s => {
      if (s.goals > 0) {
        console.log(`  - ${s.player_name}: ${s.goals} goals`);
      }
    });
  }
}

run();
