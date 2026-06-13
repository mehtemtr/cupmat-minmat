const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: existing } = await supabase
    .from('team_rosters')
    .select('id')
    .eq('team_id', 'par')
    .eq('player_name', 'Maurício');

  if (existing && existing.length > 0) {
    console.log("Maurício already exists in team_rosters with ID:", existing[0].id);
    return;
  }

  const { data, error } = await supabase
    .from('team_rosters')
    .insert({
      team_id: 'par',
      player_name: 'Maurício',
      player_position: 'Orta Saha',
      player_number: 99,
      club: 'Palmeiras',
      height: 175,
      weight: 70,
      league: 'Brasileirão',
      is_captain: false,
      date_of_birth: '2001-06-22'
    })
    .select('id');

  if (error) {
    console.error("Error inserting Maurício:", error);
  } else {
    console.log("Successfully inserted Maurício with ID:", data[0].id);
  }
}
run();
