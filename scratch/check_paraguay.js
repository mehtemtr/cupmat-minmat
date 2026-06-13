const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: players, error } = await supabase
    .from('team_rosters')
    .select('*')
    .eq('team_id', 'par');
  
  if (error) {
    console.error("Error fetching paraguay players:", error);
  } else {
    console.log("Paraguay players in database:");
    players.forEach(p => console.log(`- ${p.player_name} (${p.player_position}) id: ${p.id}`));
  }
}

run();
