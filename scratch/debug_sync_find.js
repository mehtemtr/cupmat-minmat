const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: dbRosters } = await supabaseAdmin.from("team_rosters").select("*");
  console.log("Total dbRosters:", dbRosters.length);
  
  const homePlayers = dbRosters.filter(r => r.team_id === "mex");
  console.log("Total Mexico players:", homePlayers.length);
  
  homePlayers.forEach(p => {
    if (p.player_name.includes("Gutiérrez")) {
      console.log("Found:", p);
    }
  });
}

run();
