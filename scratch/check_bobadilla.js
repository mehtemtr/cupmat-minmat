const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: bobadilla } = await supabase.from('team_rosters').select('*').ilike('player_name', '%Bobadilla%');
  console.log("Bobadilla in rosters:", bobadilla);

  if (bobadilla && bobadilla.length > 0) {
    const { data: stats } = await supabase.from('player_stage_stats').select('*').eq('player_id', bobadilla[0].id);
    console.log("Bobadilla stats in DB:", stats);
  }
}
run();
