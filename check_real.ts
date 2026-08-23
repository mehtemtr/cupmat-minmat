import { supabaseAdmin } from './lib/supabase';
async function run() {
  const { data } = await supabaseAdmin.from('cupmat_matches').select('id, api_id, home_team_name, away_team_name, date, status, home_score').ilike('home_team_name', '%Levski%');
  console.log("Levski matches:", data);
  const { data: d2 } = await supabaseAdmin.from('cupmat_matches').select('id, api_id, home_team_name, away_team_name, date, status, home_score').ilike('home_team_name', '%Celtic%');
  console.log("Celtic matches:", d2);
}
run();
