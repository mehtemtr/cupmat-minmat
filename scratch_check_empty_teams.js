const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('cupmat_matches')
    .select('id, team1_name, team2_name, match_date, tournament, round')
    .ilike('round', '%3. Tur%');
    
  if (error) console.error(error);
  else {
    console.log(data.filter(m => !m.team2_name || m.team2_name.trim() === ''));
  }
}
run();
