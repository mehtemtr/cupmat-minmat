const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  // 1. Rename Yaya Sithole to Sphephelo Sithole
  const { error: err1 } = await supabase
    .from('team_rosters')
    .update({ player_name: 'Sphephelo Sithole' })
    .eq('id', '9874579c-4d93-4a3d-9a2a-70c49a087d6e');
  
  if (err1) console.error("Error renaming Sithole:", err1);
  else console.log("Successfully renamed Sithole to Sphephelo Sithole");

  // 2. Rename Julio Enciso to Julio César Enciso
  const { error: err2 } = await supabase
    .from('team_rosters')
    .update({ player_name: 'Julio César Enciso' })
    .eq('id', '36a201b6-e275-4cd2-bf5f-f545c19560de');

  if (err2) console.error("Error renaming Enciso:", err2);
  else console.log("Successfully renamed Enciso to Julio César Enciso");

  // 3. Insert Brian Gutiérrez
  const { data: extGut, error: errGetGut } = await supabase
    .from('team_rosters')
    .select('id')
    .eq('team_id', 'mex')
    .eq('player_name', 'Brian Gutiérrez');

  if (extGut && extGut.length > 0) {
    console.log("Brian Gutiérrez already exists with ID:", extGut[0].id);
  } else {
    const { data: insGut, error: errGut } = await supabase
      .from('team_rosters')
      .insert({
        team_id: 'mex',
        player_name: 'Brian Gutiérrez',
        player_position: 'Orta Saha',
        player_number: 99,
        club: 'Chicago Fire',
        height: 178,
        weight: 70,
        league: 'MLS',
        is_captain: false,
        date_of_birth: '2003-06-17'
      })
      .select('id');
    
    if (errGut) console.error("Error inserting Brian Gutiérrez:", errGut);
    else console.log("Successfully inserted Brian Gutiérrez with ID:", insGut[0].id);
  }

  // 4. Insert Álex Arce
  const { data: extArce, error: errGetArce } = await supabase
    .from('team_rosters')
    .select('id')
    .eq('team_id', 'par')
    .eq('player_name', 'Álex Arce');

  if (extArce && extArce.length > 0) {
    console.log("Álex Arce already exists with ID:", extArce[0].id);
  } else {
    const { data: insArce, error: errArce } = await supabase
      .from('team_rosters')
      .insert({
        team_id: 'par',
        player_name: 'Álex Arce',
        player_position: 'Forvet',
        player_number: 99,
        club: 'LDU Quito',
        height: 187,
        weight: 83,
        league: 'Ecuadorian Serie A',
        is_captain: false,
        date_of_birth: '1995-06-16'
      })
      .select('id');
    
    if (errArce) console.error("Error inserting Álex Arce:", errArce);
    else console.log("Successfully inserted Álex Arce with ID:", insArce[0].id);
  }
}

run();
