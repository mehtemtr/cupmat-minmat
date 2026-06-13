const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Checking player_stage_stats for matchday_1 and matchday_2...");
  
  const { data: stats, error } = await supabase
    .from('player_stage_stats')
    .select(`
      player_id,
      stage,
      goals,
      assists,
      own_goals,
      yellow_cards,
      red_cards,
      points,
      team_rosters (
        player_name,
        team_id,
        player_position
      )
    `)
    .or('stage.eq.matchday_1,stage.eq.matchday_2');

  if (error) {
    console.error("Error fetching stats:", error);
    return;
  }

  // Filter players who have active contributions
  const active = stats.filter(s => s.goals > 0 || s.assists > 0 || s.own_goals > 0 || s.yellow_cards > 0 || s.red_cards > 0);
  console.log(`\nFound ${active.length} active players in DB:`);
  active.forEach(s => {
    const name = s.team_rosters?.player_name || 'Unknown';
    const team = s.team_rosters?.team_id || '???';
    console.log(`- ${name} (${team}) [${s.stage}] - Goals: ${s.goals}, Assists: ${s.assists}, Yellows: ${s.yellow_cards}, Reds: ${s.red_cards}, OG: ${s.own_goals}, Points: ${s.points}`);
  });
}

run();
