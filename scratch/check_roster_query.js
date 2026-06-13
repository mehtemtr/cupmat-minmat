const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ewdfexbuhgtsnsxveobc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3ZGZleGJ1aGd0c25zeHZlb2JjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYyMTc1NiwiZXhwIjoyMDk1MTk3NzU2fQ.FHFbcvoQrigEaBgPN6yHfUA6NT8oCkrQoHun0yFR_NE';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check(query, label) {
  const { data } = await supabase.from('team_rosters').select('id, team_id, player_name, player_position').ilike('player_name', `%${query}%`);
  console.log(`${label}:`, data);
}

async function run() {
  await check('Gutiérrez', 'Gutiérrez');
  await check('Arce', 'Arce');
  await check('Sithole', 'Sithole');
  await check('Montes', 'Montes');
  await check('Zwane', 'Zwane');
  await check('Freeman', 'Freeman');
  await check('David', 'David');
  await check('Sibisi', 'Sibisi');
  await check('Gi-hyuk', 'Gi-hyuk');
  await check('Fougerolles', 'de Fougerolles');
  await check('Katić', 'Katić');
  await check('Mokoena', 'Mokoena');
  await check('Adams', 'Adams');
}

run();
